import { getDefaultKeyBinding } from 'draft-js'

export const KeyBoundAction = {}

export const KeyBindings = {}

export const KeyBindingFn = event => {
  for (const [action, isAction] of Object.entries(KeyBindings)) {
    if (isAction(event)) return action
  }

  return getDefaultKeyBinding(event)
}
