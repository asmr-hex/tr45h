import { getDefaultKeyBinding } from 'draft-js'

export const KeyBoundAction = {
  CloseCLI: 'close-cli',
  ExecuteCommand: 'execute-command',
}

export const KeyBindings = {
  [KeyBoundAction.CloseCLI]:         e => e.keyCode === 32 && e.shiftKey,
  [KeyBoundAction.ExecuteCommand]:   e => e.keyCode === 13,
}

export const KeyBindingFn = event => {
  for (const [action, isAction] of Object.entries(KeyBindings)) {
    if (isAction(event)) return action
  }

  return null
}
