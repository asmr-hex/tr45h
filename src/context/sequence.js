import React, { createContext, useContext, useReducer } from 'react'
import { keys, flatMap, reduce, uniq, intersection, xor } from  'lodash'

const API_TOKEN = "aMdevlgMb06KIjs2yy4pkFbw9IOwq5Z6cZFWncsj"

const SequenceContext = createContext()

export const useSequenceContext = () => {
  const ctx = useContext(SequenceContext)
  if (ctx === undefined) {
    throw new Error(`useSequenceContext must be invoked in a child componenet of SequenceProvider`)
  }
  return ctx
}


const initialReducerState = {
  soundBuffers: {}, // byName
  sequences: {}, // by id
}

const sequenceReducer = (state, action) => {
  switch(action.type) {
  case 'UPDATE_SEQUENCES':
    const { sequences, newSounds } = action
    return {
      sequences,
      soundBuffers: reduce(newSounds, (acc, v) => ({...acc, [v]: null}), state.soundBuffers)
    }
  case 'FETCHED_NEW_SOUNDS':
    console.log("FETCHED NEW SOUNDS")
    console.log(action)
    return {
      ...state,
      soundBuffers: reduce(
        action.sounds,
        (acc, v, k) => ({...acc, [k]: v}),
        state.soundBuffers,
      )
    }
  default:
    return state
  }
}

// NOTES: fetching previews do NOT take authorization headers....in fact, if you include them
// it will cause a preflight cors OPTIONS request to be made....unfortunately, the
// freesound API doesn't return 'Acess-Control-Allow-Origin: *' in the preflight
// OPTION reponse for previews (media server i guess?)....
const makeFetchNewSounds = dispatch => async keywords => {
  // now, perform a search using the FreeSound API using the keywords and get preview urls
  let keywordToBuffer = {}
  for (const keyword of keywords) {
    if (keyword === "_") continue

    console.log(`Fetching Sounds Related to: ${keyword}`)
    const { results } = await fetch(
      `https:freesound.org/apiv2/search/text/?query=${keyword}&fields=name,previews&page_size=150`,
      {headers: {Authorization: `Token ${API_TOKEN}`}}
    ).then(res => res.json())

    // are there results?
    if (results.length === 0) continue

    console.log(`Found Sounds Related to: ${keyword}`)
    
    // randomly select a result from array of results
    const result = results[Math.floor(Math.random() * results.length)]
    const previewUrl = result.previews["preview-hq-mp3"]

    console.log(`Fetching MP3 For: ${result.name}`)
    // fetch Array Buffer of Mp3
    const buffer = await fetch(previewUrl)
          .then(res => res.arrayBuffer())

    keywordToBuffer[keyword] = buffer

    console.log(`Downloaded MP3 For: ${result.name}`)
  }
  
  dispatch({type: 'FETCHED_NEW_SOUNDS', sounds: keywordToBuffer})
}

export const SequenceProvider = props => {
  const [sequenceState, sequenceDispatch] = useReducer(sequenceReducer, initialReducerState)

  const fetchNewSounds = makeFetchNewSounds(sequenceDispatch)
  
  return (
    <SequenceContext.Provider value={{sequenceState, fetchNewSounds, sequenceDispatch}}>
      {props.children}
    </SequenceContext.Provider>
  )
}
