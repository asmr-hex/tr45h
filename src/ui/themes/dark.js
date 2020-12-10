import { createMuiTheme } from '@material-ui/core/styles'
import { red } from '@material-ui/core/colors'

import { typography } from './typography'


// Dark theme
const theme = () => createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#26292C',
      light: 'rgb(81, 91, 95)',
      dark: 'rgb(26, 35, 39)',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FFB74D',
      light: 'rgb(255, 197, 112)',
      dark: 'rgb(200, 147, 89)',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    titleBar: {
      main: '#555555',
      contrastText: '#ffffff',
    },
    error: {
      main: red.A400,
    },
    text: {
      primary: '#ffffff',
      tokens: {
        identifier: '#ffffff',
        number: '#8e7dbe',
        hz: '#8a38cf',
        unit: '#513866',
        separator: '#364958',
        operator: '#662e9b',
        error: '#ea3546',
        comment: '#f1e3d3',
      },
      status: {
        searching: '#ffd23f',
        downloading: '#0ead69',
        available: '#43bccd',
        unavailable: '#ff6b6b',
      },
    },
    logo: [
      '#fddeff',
      '#d6efff',
      '#dbffd6',
      '#f4edff',
      '#fffded',
      '#dde3ed',
    ],
    background: {
      default: '#282c34',
      secondary: '#23272e',
      error: '#ffe66d',
    },
    divider: '#ffffff',
  },
  typography,
})

export default theme
