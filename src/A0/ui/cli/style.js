import { makeStyles } from '@material-ui/core/styles'

import { TokenTypes } from '../../cli/commands/types'


export const useCliStyles = makeStyles(theme => ({
  [TokenTypes.Command]: { color: theme.palette.text.cli.command },
  [TokenTypes.Argument]: { color: theme.palette.text.cli.argument },
  [TokenTypes.Error]: {
    color: theme.palette.text.cli.error,
    textDecoration: 'line-through',
  },
  'default': { color: 'cornflowerblue'},
  'sound': {color: 'tomato'},
}))
