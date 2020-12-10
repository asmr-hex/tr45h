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
      tertiary: '#ffffff',
      tokens: {
        identifier: '#282c34',
        number: '#8e7dbe',
        hz: '#17b322',
        unit: '#cf0eab',
        separator: '#364958',
        operator: '#662e9b',
        error: '#ea3546',
        comment: '#f1e3d3',

        variable: '#e84870',
        variableDecl: '#e848e0',
        assignmentOp: '#e84870',
        fn: '#6038a6',
        fnBracket: '#204d27',
        fnParameter: '#79b356',
        fnParamKvDelimiter: '#524454',
        fnParamDelimiter: '#524454',
        soundLiteral: '#3885a6',
        beatDivBracket: '#962c48',
        sequenceBracket: '#2d2c96',
        choiceOp: '#bf1b2e',
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
      tertiary: '#39323d',
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
