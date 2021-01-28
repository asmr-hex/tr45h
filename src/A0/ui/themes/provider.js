import React, { useState } from 'react'
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles'
import { getTheme, Theme, CustomTheme } from './index'


export const ThemeProvider = props => {
  // eslint-disable-next-line react/prop-types
  const { children } = props

  // Read current theme from localStorage or maybe from an api
  const currentTheme = localStorage.getItem('slopStudioTheme') || Theme.Light

  // State to hold the selected theme name
  const [themeName, setThemeName] = useState(currentTheme)

  // Retrieve the theme object by theme name
  const theme = getTheme(themeName)

  // Wrap setThemeName to store new theme names in localStorage
  const setThemeNameWithPersistence = (name) => {
    localStorage.setItem('slopStudioTheme', name)
    setThemeName(name)
  }

  const toggleTheme = () =>
        setThemeNameWithPersistence(themeName === Theme.Light ? Theme.Dark : Theme.Light)
  
  const contextValue = {
    theme: themeName,
    setTheme: setThemeName,
    isLightTheme: themeName === Theme.Light,
    toggleTheme,
  }

  return (
    <CustomTheme.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </CustomTheme.Provider>
  )
}
