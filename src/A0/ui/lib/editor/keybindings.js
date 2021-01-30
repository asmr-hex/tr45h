import { getDefaultKeyBinding } from 'draft-js'

export const KeyBoundAction = {
  CycleSuggestions: 'cycle-suggestions',
  AutoComplete: 'auto-complete',
}

export const KeyBindings = {
  [KeyBoundAction.CycleSuggestions]: e => e.keyCode === 9 && e.shiftKey,
  [KeyBoundAction.AutoComplete]:     e => e.keyCode === 9,
}

export const KeyBindingFn = overrideFn => event => {
  const overrideAction = overrideFn(event)
  if (overrideAction) return overrideAction
  
  for (const [action, isAction] of Object.entries(KeyBindings)) {
    if (isAction(event)) return action
  }

  return getDefaultKeyBinding(event)
}
