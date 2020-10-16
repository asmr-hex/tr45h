import React, {useEffect, useState, useRef} from 'react'
import { keys, flatMap, map, reduce, debounce, intersection, xor, uniq } from 'lodash'
import './App.css'

import {Editor, EditorState, convertToRaw} from 'draft-js'
import 'draft-js/dist/Draft.css'

import { useSequenceContext, SequenceProvider } from './context/sequence'
import { Sequencer } from './sequencer'


const MusicEditor = props => {
  const { sequenceState, fetchNewSounds, sequenceDispatch } = useSequenceContext()
  const [editorState, setEditorState] = useState(
    () => EditorState.createEmpty()
  )
  const editorRef = useRef(null)

  useEffect(() => {
    editorRef.current.focus()
  }, [])

  
  // to deal with stale closures
  const onNewSounds = sequences => {
    const uniqSounds = uniq(flatMap(sequences, s => s.steps))
    const newSounds = intersection(xor(keys(sequenceState.soundBuffers), uniqSounds), uniqSounds)

    sequenceDispatch({
      type: 'UPDATE_SEQUENCES',
      sequences,
      newSounds,
    })
    fetchNewSounds(newSounds)
  }
  
  const onChange = useRef(debounce(
    (newRawContent, oldRawContent, newSoundCallback) => {
      // do some early returning so we don't trigger unnecessary work

      // normalize text (remove the extra spaces in each block)
      const newContent = map(
        newRawContent.blocks,
        v => ({...v, text: reduce(v.text.split(" ").filter(t => t !== ""), (acc, s) => `${acc} ${s}`, '').trim()})
      )
      const oldContent = map(
        oldRawContent.blocks,
        v => ({...v, text: reduce(v.text.split(" ").filter(t => t !== ""), (acc, s) => `${acc} ${s}`, '').trim()})
      )


      // don't do anything if nothing but empty space has been added
      if (reduce(newContent, (acc, v) => `${acc}${v.text}`, "")
          === reduce(oldContent, (acc, v) => `${acc}${v.text}`, "")) return

      const nonEmptyBlocks = newContent.filter(o => o.text !== "")
      const sequences =  nonEmptyBlocks.map(v => ({key: v.key, text: v.text, steps: v.text.split(" ")}))

      // to deal with stale state.....ugh.
      newSoundCallback(sequences)

      // pre-matiure optimization is evil..... do below stuff later if needed...
      
      // const oldBlocks = reduce(oldContent, (acc, v) => ({...acc, [v.key]: v}), {})

      // const oldNonEmptyBlocks = oldContent.filter(o => o.text !== "")
      // const newNonEmptyBlocks = newContent.filter(o => o.text !== "")

      // // get the symettric difference (xor) of old and new non empty blocks.
      // // then take the intersection of the result with each old and new.
      // // this tells us which blocks have been added and deleted.
      // const diff = xor(keys(sequenceState.sequences), newNonEmptyBlocks.map(m => m.key))
      // const deletedBlockKeys = intersection(diff, keys(sequenceState.sequences))
      // const addedBlockKeys = intersection(diff, newNonEmptyBlocks.map(m => m.key))
      

      // // which non-empty blocks have changed?
      // const modifiedNewNonEmptyBlocks = newNonEmptyBlocks.filter(
      //   b => reduce(addedBlockKeys, (acc, v) => b.key !== v && acc, true) // filter out new blocks
      // ).filter(
      //   b => oldBlocks[b.key].text !== b.text
      // )

      // sequenceDispatch({
      //   type: 'UPDATE_SEQUENCES',
      //   blocks: {
      //     new: addedBlocks,
      //     modified: modifiedNewNonEmptyBlocks,
      //     deletedKeys: deletedBlocksKeys,
      //   }
      // })
    },
    500,
  )).current
  
  const onChangeWrapper = newEditorState => {
    const newContent = convertToRaw(newEditorState.getCurrentContent())
    const oldContent = convertToRaw(editorState.getCurrentContent())
    
    onChange(newContent, oldContent, onNewSounds)
    
    setEditorState(newEditorState)
  }
  
  return (
    <div style={{width: '50%', height: '50%'}}>
      <Editor ref={editorRef} editorState={editorState} onChange={onChangeWrapper}/> 
    </div>
  )
}

const App = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  
  const playNote = c => {
    console.log(c)
    // setIsPlaying(!isPlaying)
  }
  
  return (
    <div className="App">
      <SequenceProvider>
        <header className="App-header">
          <MusicEditor onChange={playNote}/>
          <Sequencer/>
        </header>
      </SequenceProvider>
    </div>
  );
}

export default App;
