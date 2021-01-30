import { getDefaultKeyBinding } from 'draft-js'


export const KeyBoundAction = {
  GetNewSound: 'get-new-sound',
  OpenCLI: 'open-cli',
  CycleAutoCompletion: 'cycle-auto-completion',
  FocusCLI: 'focus-cli',
}

const KeyRepetitions = {}
const KeyRepetitionsTimeout = {}
const detectDoubleTap = (event, keyCode) => {
  const threshold = 500 // ms

  if (event.keyCode !== keyCode) return false
  
  if (keyCode in KeyRepetitions) {
    // check the last stroke time
    if (((new Date()) - KeyRepetitions[keyCode]) < threshold) return true
  }
  
  KeyRepetitions[keyCode] = new Date()
  if (keyCode in KeyRepetitionsTimeout) clearInterval(KeyRepetitionsTimeout[keyCode])
  KeyRepetitionsTimeout[keyCode] = setTimeout(() => {
    delete KeyRepetitions[keyCode]
  }, threshold)
  
  return false
}

const KeyBindings = {
  [KeyBoundAction.GetNewSound]:         e => e.keyCode === 13 && e.shiftKey,
  [KeyBoundAction.OpenCLI]:             e => e.keyCode === 32 && e.shiftKey,
  [KeyBoundAction.FocusCLI]:            e => detectDoubleTap(e, 16),
}

export const KeyBindingFn = event => {
  for (const [action, isAction] of Object.entries(KeyBindings)) {
    if (isAction(event)) return action
  }

  return null
}
