import { makeStyles } from "@material-ui/core/styles"

import {
  LexicalTokenType,
  SemanticTokenType,
} from '../../interpreter/types/tokens'


/**
 * css class generator for alea-lang syntax highlighting.
 * 
 * @description we use the material-ui 'makeStyles' function for
 * generating css classes that use the injected theme.
 */
export const useSyntaxStyles = makeStyles(theme => ({
  [LexicalTokenType.Identifier]: { color: theme.palette.text.tokens.identifier },
  number:     { color: theme.palette.text.tokens.number },
  hz:         { color: theme.palette.text.tokens.hz },
  'hz_unit':  { color: theme.palette.text.tokens.unit },
  separator:  { color: theme.palette.text.tokens.separator },
  operator:   { color: theme.palette.text.tokens.operator },
  comment:    { color: theme.palette.text.tokens.comment },

  'variable':              { color: theme.palette.text.tokens.variable },
  'variable_decl':         { color: theme.palette.text.tokens.variableDecl },
  'assignment_op':         { color: theme.palette.text.tokens.assignmentOp },
  [SemanticTokenType.Fn]:  { color: theme.palette.text.tokens.fn },
  'fn_bracket':            { color: theme.palette.text.tokens.fnBracket },
  'fn_parameter':          { color: theme.palette.text.tokens.fnParameter },
  'fn_param_kv_delimiter': { color: theme.palette.text.tokens.fnParamKvDelimiter },
  'fn_param_delimiter':    { color: theme.palette.text.tokens.fnParamDelimiter },
  'sound_literal':         { color: theme.palette.text.tokens.soundLiteral },
  'beat_div_bracket':      { color: theme.palette.text.tokens.beatDivBracket },
  'sequence_bracket':      { color: theme.palette.text.tokens.sequenceBracket },
  'choice_op':             { color: theme.palette.text.tokens.choiceOp },
  
  error: {
    color: theme.palette.text.tokens.error,
    backgroundColor: theme.palette.background.error,
  },
  searching:   { color: theme.palette.text.status.searching },
  downloading: { color: theme.palette.text.status.downloading },
  available:   { color: theme.palette.text.status.available },
  unavailable: { color: theme.palette.text.status.unavailable },
  currentStep: { borderBottom: `2px ${theme.palette.divider} solid` },
}))
