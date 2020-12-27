import { getDefaultKeyBinding } from 'draft-js'


export const KeyBoundAction = {
  GetNewSound: 'get-new-sound',
  OpenCLI: 'open-cli',
  CycleAutoCompletion: 'cycle-auto-completion',
}

const KeyBindings = {
  [KeyBoundAction.GetNewSound]:         e => e.keyCode === 13 && e.shiftKey,
  [KeyBoundAction.OpenCLI]:             e => e.keyCode === 32 && e.shiftKey,
  [KeyBoundAction.CycleAutoCompletion]: e => e.keyCode === 9,
}

export const KeyBindingFn = event => {
  for (const [action, isAction] of Object.entries(KeyBindings)) {
    if (isAction(event)) return action
  }

  return getDefaultKeyBinding(event)
}
