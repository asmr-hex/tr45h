import { makeStyles } from '@material-ui/core/styles'

import { CLITokenTypes } from '../../cli/commands/types'


export const useCLIStyles = makeStyles(theme => ({
  [CLITokenTypes.Command]: { color: theme.palette.text.cli.command },
  [CLITokenTypes.Argument]: { color: theme.palette.text.cli.argument },
  [CLITokenTypes.Error]: {
    color: theme.palette.text.cli.error,
    textDecoration: 'line-through',
  },
}))
