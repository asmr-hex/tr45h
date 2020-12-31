import { getDefaultKeyBinding } from 'draft-js'

export const KeyBoundAction = {
  CloseCLI: 'close-cli',
}

export const KeyBindings = {
  [KeyBoundAction.CloseCLI]: e => e.keyCode === 32 && e.shiftKey,
}

export const KeyBindingFn = event => {
  for (const [action, isAction] of Object.entries(KeyBindings)) {
    if (isAction(event)) return action
  }

  return getDefaultKeyBinding(event)
}
