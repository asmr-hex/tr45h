import React, { createContext, useContext, useReducer } from 'react'
import { merge, reduce, omit } from  'lodash'

const API_TOKEN = "aMdevlgMb06KIjs2yy4pkFbw9IOwq5Z6cZFWncsj"

const SequenceContext = createContext()

export const useSequenceContext = () => {
  const ctx = useContext(SequenceContext)
  if (ctx === undefined) {
    throw new Error(`useSequenceContext must be invoked in a child componenet of SequenceProvider`)
  }
  return ctx
}

// the statuses that a sound can have
export const SoundStatus = {
  Searching: 'searching',
  Downloading: 'downloading',
  Available: 'available',
  Unavailable: 'unavailable',
}

const initialReducerState = {
  sounds: {},    // byName
  sequences: {}, // by id
}

// returns a new state.sounds object with new sound entries.
// the new sounds will be 'searching' and have null buffers.
const mergeSounds = (state, addedSoundNameList, deletedSoundNameList) =>
      merge(
        {},
        omit(state.sounds, deletedSoundNameList),
        reduce(
          addedSoundNameList,
          (acc, v) => ({
            ...acc,
            [v]: {
              status: SoundStatus.Searching,
              buffer: null,
            }
          }),
          {}
        )
      )

// returns a new state.sounds object with the buffers populated
// and the status set to 'available'
const loadSoundBuffers = (state, buffersByName) =>
      merge(
        {},
        state.sounds,
        reduce(
          buffersByName,
          (acc, buffer, name) => ({
            ...acc,
            [name]: {
              status: SoundStatus.Available,
              buffer, 
            }
          }),
          {}
        )
      )

const setSoundStatuses = (state, statusesByName) =>
      merge(
        {},
        state.sounds,
        reduce(
          statusesByName,
          (acc, status, name) => ({
            ...acc,
            [name]: {
              status
            }
          }),
          {}
        )
      )

const sequenceReducer = (state, action) => {
  switch(action.type) {
  case 'UPDATE_SEQUENCES':
    const { sequences, sounds } = action
    return {
      sequences,
      sounds: mergeSounds(state, sounds.added, sounds.deleted)
    }
  case 'SOUNDS_DOWNLOADED':
    return {
      ...state,
      sounds: loadSoundBuffers(state, action.sounds)
    }
  case 'SOUND_STATUSES_UPDATED':
    return {
      ...state,
      sounds: setSoundStatuses(state, action.statuses)
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


    if (results.length === 0) {
      // darn. no results found. mark this as unavailable.
      dispatch({
        type: 'SOUND_STATUSES_UPDATED',
        statuses: { [keyword]: SoundStatus.Unavailable }
      })
      continue
    }

    // we found results, lets start downloading the sound.
    dispatch({
      type: 'SOUND_STATUSES_UPDATED',
      statuses: { [keyword]: SoundStatus.Downloading }
    })
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
  
  dispatch({type: 'SOUNDS_DOWNLOADED', sounds: keywordToBuffer})
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
