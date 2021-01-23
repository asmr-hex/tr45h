import { makeStyles } from '@material-ui/core/styles'

import { TokenTypes } from '../../cli/commands/types'


export const useCLIStyles = makeStyles(theme => ({
  [TokenTypes.Command]: { color: theme.palette.text.cli.command },
  [TokenTypes.Argument]: { color: theme.palette.text.cli.argument },
  [TokenTypes.Error]: {
    color: theme.palette.text.cli.error,
    textDecoration: 'line-through',
  },
  'SUGGESTION': { color: '#9c9c9c'}
}))
