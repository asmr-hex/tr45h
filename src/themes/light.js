import { createMuiTheme } from '@material-ui/core/styles'
import { red } from '@material-ui/core/colors'

import { typography } from './typography'


// Normal or default theme
const theme = () => createMuiTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#cc4444',
    },
    error: {
      main: red.A400,
    },
    text: {
      primary: '#23272e',
      tokens: {
        identifier: '#282c34',
        number: '#8e7dbe',
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
      '#ff6bc6',
      '#68bee8',
      '#8acc7c',
      '#eb683d',
      '#fff785',
      '#6b89ff',
    ],
    background: {
      default: '#ffffff',
      secondary: '#ffd23f',
      error: '#ffe66d',
    },
    divider: '#292f36',
    titleBar: {
      main: '#eeeeee',
      contrastText: '#222222',
    },
  },
  typography,
})

export default theme
