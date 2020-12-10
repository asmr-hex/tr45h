import { createContext, useContext } from 'react'
import light from './light'
import dark from './dark'


export const Theme = {
  Light: 'light',
  Dark:  'dark',
}

const themes = {
  [Theme.Light]: light,
  [Theme.Dark]: dark,
}

export const getTheme = theme => themes[theme]()

export const CustomTheme = createContext()

export const useTheme = () => {
  const ctx = useContext(CustomTheme)
  if (ctx === undefined)
    throw new Error(`useTheme must be invoked in a child component of CustomThemeProvider`)

  return ctx
}
