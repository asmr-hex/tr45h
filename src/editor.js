import React, { useCallback, useEffect, useState, useRef } from 'react'
import {Editor, EditorState, SelectionState, convertToRaw, CompositeDecorator, Modifier, getDefaultKeyBinding, convertFromRaw} from 'draft-js'
import 'draft-js/dist/Draft.css'
import { keys, filter, findIndex, flatMap, map, reduce, debounce, intersection, xor, uniq } from 'lodash'

import { useSequenceContext, SoundStatus } from './context/sequence'


let EntityKeyMap = {}

// inline styles for sound word states
const decorated = {
  searching: ({children}) => <span style={{ color: "pink" }}>{children}</span>,
  downloading: ({children}) => <span style={{ color: "blue" }}>{children}</span>,
  available:   ({children}) => <span style={{ color: "green" }}>{children}</span>,
  unavailable: ({children}) => <span style={{ color: "red" }}>{children}</span>
}

const handleStrategy = statuses => (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges(
    character => {
      const entityKey = character.getEntity()
      if (entityKey === null) return false
      return entityKey === EntityKeyMap[statuses[0]]
    },
    callback
  )
}

const decorator = new CompositeDecorator([
  {
    strategy: handleStrategy([SoundStatus.Searching]),
    component: decorated.searching,
  },
  {
    strategy: handleStrategy([SoundStatus.Downloading]),
    component: decorated.downloading,
  },
  {
    strategy: handleStrategy([SoundStatus.Available]),
    component: decorated.available,
  },  {
    strategy: handleStrategy([SoundStatus.Unavailable]),
    component: decorated.unavailable,
  }
])

const selectAll = (editorState, currentContent) =>
      editorState.getSelection().merge({
        anchorKey: currentContent.getFirstBlock().getKey(),
        anchorOffset: 0,  
        
        focusOffset: currentContent.getLastBlock().getText().length, 
        focusKey: currentContent.getLastBlock().getKey(),
      })


const keyBindingFn = e => {
  // detect Space
  if (e.keyCode === 32) {
    return 'create-sound'
  }
  // detect Return
  if (e.keyCode === 13) {
    return 'create-sequence'
  }

  return getDefaultKeyBinding(e)
}

const createEntities = (editorState) => {
  const { contentState, ...entityMap} = reduce(
    SoundStatus,
    (acc, status) => {
      // create entity
      const contentStateWithNewEntity = acc.contentState.createEntity(
        'SOUND_WORD_STATUS',
        'IMMUTABLE',
      )
      // get last entity key
      const key = contentStateWithNewEntity.getLastCreatedEntityKey()
      
      return {...acc, [status]: key, contentState: contentStateWithNewEntity}
    },
    {contentState: editorState.getCurrentContent()}
  )
   
  EntityKeyMap = entityMap
  EditorState.push(editorState, contentState)
}

export const MusicEditor = props => {
  const {
    sequenceState,
    fetchNewSounds,
    sequenceDispatch
  } = useSequenceContext()

  // setup editor state
  const [editorState, setEditorState] = useState(
    () => EditorState.createEmpty(decorator)
  )
  const editorRef = useRef(null)

  // update the status entity mapping for all text when the soundStatuses change
  useEffect(() => {
    // save the original selection state
    const oldSelection = editorState.getSelection()
    let newEditorState = editorState
    const contentState = newEditorState.getCurrentContent()
        
    // for all sound_words
    for (const block of contentState.getBlocksAsArray()) {
      for (const [soundWord, {status}] of Object.entries(sequenceState.sounds)) {
        const text = block.getText()
        const re = new RegExp(`\\b${soundWord}\\b`, 'g')
        const matches = [...text.matchAll(re)]
        matches.forEach(match => {
          const contentState = newEditorState.getCurrentContent()
          // make selection based on matches
          const selection = SelectionState
                .createEmpty(block.getKey())
                .merge({
                  anchorOffset: match.index,
                  focusOffset: match.index + match[0].length
                })
          const entityKey = EntityKeyMap[status]
          const contentStateWithStatus = Modifier.applyEntity(
            contentState,
            selection,
            entityKey,
          )
          newEditorState = EditorState.push(newEditorState, contentStateWithStatus, 'apply-entity')
          newEditorState = EditorState.forceSelection(newEditorState, oldSelection)
        })
      }
    }
    setEditorState(newEditorState)
  }, [sequenceState.sounds])
  
  // auto focus on editor and create status entities on mount
  useEffect(() => {
    editorRef.current.focus()

    // create entities and entity map
    createEntities(editorState)
  }, [])

  
  // to deal with stale closures
  const onNewSounds = sequences => {
    const currSounds = uniq(flatMap(sequences, s => s.steps))
    const prevSounds = keys(sequenceState.sounds)
    const sounds = {
      added:   intersection(xor(prevSounds, currSounds), currSounds),
      deleted: intersection(xor(prevSounds, currSounds), prevSounds)
    }

    sequenceDispatch({
      type: 'UPDATE_SEQUENCES',
      sequences,
      sounds,
    })
    fetchNewSounds(sounds.added)
  }

  const addSound = rawContent => {
    // normalize text (remove the extra spaces in each block)
    const content = map(
      rawContent.blocks,
      v => ({...v, text: reduce(v.text.split(" ").filter(t => t !== ""), (acc, s) => `${acc} ${s}`, '').trim()})
    )

    const nonEmptyBlocks = content.filter(o => o.text !== "")
    const sequences =  nonEmptyBlocks.map(v => ({key: v.key, text: v.text, steps: v.text.split(" ")}))

    onNewSounds(sequences)
  }

  const onChangeWrapper = newEditorState => {
    setEditorState(newEditorState)
  }

  const addCharacter = (selection, content, character) => {
    const newContentState = character === ' '
          ? Modifier.insertText(
            content,
            selection,
            character
          )
          : Modifier.splitBlock(
            content,
            selection
          )

    return EditorState.push(editorState, newContentState, 'insert-characters')
  }

  const getPreviousWord = text => {
    const words = text.split(" ")
    const word = words[words.length - 1] 
    return {word, start: text.length - word.length, end: text.length}
  }

  const setWordStatusEntity = (word, start, end, blockKey, newEditorState) => {
    // get status of this word
    const { status } = sequenceState.sounds[word]
    const selection = newEditorState.getSelection()
    
    // create temporary selection
    const wordSelection = SelectionState
          .createEmpty(blockKey)
          .merge({
            anchorOffset: start,
            focusOffset: end
          })

    // apply status entity
    const contentStateWithStatus = Modifier.applyEntity(
      newEditorState.getCurrentContent(),
      wordSelection,
      EntityKeyMap[status],
    )
    newEditorState = EditorState.push(newEditorState, contentStateWithStatus, 'apply-entity')

    // set selection back to original selection
    newEditorState = EditorState.forceSelection(newEditorState, selection)

    return newEditorState
  }
  
  const deleteSoundWord = () => {
    // todo

    return 'handled'
  }

  const createSoundWord = () => {
    // insert empty space
    let newEditorState = EditorState.push(
      editorState,
      Modifier.insertText(editorState.getCurrentContent(), editorState.getSelection(), ' '),
      'insert-characters'
    )
    const selection = newEditorState.getSelection()

    // get previous character
    const cursorIndex = selection.getFocusOffset()
    const prevChar = cursorIndex < 1
          ? ''
          : newEditorState
          .getCurrentContent()
          .getBlockForKey(selection.getFocusKey())
          .getText()[cursorIndex - 1]

    // is the previous character is not empty
    if (prevChar !== "" || prevChar === " ") {
      // now we can register this new sound-word
      // registerSoundWord(convertToRaw(newEditorState.getCurrentContent()))

      // get the whole previous word
      const {word, start, end} = getPreviousWord(
        newEditorState
          .getCurrentContent()
          .getBlockForKey(selection.getFocusKey())
          .getText().substr(0, cursorIndex)
      )

      // is the word an existing sound word?
      if (sequenceState.sounds[word]) {
        // we must set its status
        newEditorState = setWordStatusEntity(
          word,
          start,
          end,
          selection.getFocusKey(),
          newEditorState,
        )
      }
    }

    setEditorState(newEditorState)

    return 'handled'
  }

  const createSequence = () => {
    // split the block
    let newEditorState = EditorState.push(
      editorState,
      Modifier.splitBlock(editorState.getCurrentContent(), editorState.getSelection()),
      'insert-characters'
    )
    const selection = newEditorState.getSelection()

    // check the last character of the previous block
    const prevBlock = newEditorState
          .getCurrentContent()
          .getBlockBefore(selection.getFocusKey())
    const prevBlockText = prevBlock.getText()
    const prevBlockLastChar = prevBlockText[prevBlockText.length - 1]

    // check the next character in the current block

    // 

    return 'handled'
  }

  const handleActions = cmd => {
    const selection = editorState.getSelection()

    // if the selection is not collapsed, do nothing
    if (!selection.isCollapsed()) return 'not-handled'

    switch(cmd) {
    case 'create-sound':
      return createSoundWord()
    case 'create-sequence':
      return createSequence()
    case 'delete-sound':
      return deleteSoundWord()
    default:
      return 'not-handled'
    }
  }
  
  
  const handleCreateSound = cmd => {
    // EDGE CASES:
    // (1) space or return in the middle of a word that was previously an entity already (or not)
    let selection = editorState.getSelection()
    
    if ((cmd === 'create-sound' || cmd === 'create-sequence') && selection.isCollapsed()) {
      const contentState = editorState.getCurrentContent()
      const rawContentState = convertToRaw(contentState)

      let newEditorState = addCharacter(selection, contentState, cmd === 'create-sound' ? ' ' : '\n')
      selection = newEditorState.getSelection()
      
      // get the block of this selection
      const blockKey = selection.getFocusKey()

      // get the index of the block key
      const blockIndex = findIndex(rawContentState.blocks, b => b.key === blockKey)

      // get the previous character
      const cursorIndex = selection.getFocusOffset()
      const prevChar = cursorIndex < 1 ? "" : rawContentState.blocks[blockIndex].text[cursorIndex-1]
      
      if (prevChar !== "" || prevChar === " ") {
        const newRawContentState = convertToRaw(newEditorState.getCurrentContent())
        // addSound
        addSound(newRawContentState)

        // // get the last word
        const { word, start, end } = getPreviousWord(newRawContentState.blocks[blockIndex].text.substr(0, cursorIndex))
        
        if (sequenceState.sounds[word]) {
          const status = sequenceState.sounds[word].status
          const block = newEditorState.getCurrentContent().getBlockForKey(blockKey)
          const wordSelection = SelectionState
                .createEmpty(block.getKey())
                .merge({
                  anchorOffset: start,
                  focusOffset: end
                })
          const entityKey = EntityKeyMap[status]
          const contentStateWithStatus = Modifier.applyEntity(
            contentState,
            wordSelection,
            entityKey,
          )
          newEditorState = EditorState.push(newEditorState, contentStateWithStatus, 'apply-entity')
          newEditorState = EditorState.forceSelection(newEditorState, selection)
 
        }
      }

      setEditorState(newEditorState)
      
      return 'handled'
    }

    return 'not-handled'
  }

  // a new sound word will be created under the following circumstances
  // (1) a space is added and the previous character is not a space or empty space
  // (2) a return is added and the last character on the previous line is not a space of empty space and the last word is not already a registered entity
  
  return (
    <div style={{width: '50%', height: '50%'}}>
      <Editor
        ref={editorRef}
        editorState={editorState}
        onChange={onChangeWrapper}
        handleKeyCommand={handleCreateSound}
        keyBindingFn={keyBindingFn}
      />
      <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '10px', border: '1px red solid'}}>
        <div>
          {
            map(sequenceState.sounds,
                (s, name) =>
                <div>{`${name}: ${s.status}`}</div>
               )
          }
        </div>
        <div>
          {
            map(sequenceState.sequences,
                s =>
                <div>{`${s.text}`}</div>
               )
          }
        </div>
      </div>
    </div>
  )
}
