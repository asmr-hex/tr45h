import React from 'react'
import { withTheme, styled } from "@material-ui/core/styles"

import { useStyles, useRuntime } from 'A0/state'


export const LineClassNames = {
  LineNumber: `ln-num`,
  LineContent: `ln-content`,
}

let previousLine = null
export const visuallyMark = (currentLine, theme) => {
  if (previousLine) {
    const contentId = `${LineClassNames.LineContent}-${previousLine}`
    const numberId  = `${LineClassNames.LineNumber}-${previousLine}`
    const contentEl = document.getElementById(contentId)
    const numberEl = document.getElementById(numberId)
    if (contentEl) contentEl.classList.remove(theme.classes.editor.currentLine)
    if (numberEl)  numberEl.classList.remove(theme.classes.editor.currentLineNumber)
  }

  const contentId = `${LineClassNames.LineContent}-${currentLine}`
  const numberId  = `${LineClassNames.LineNumber}-${currentLine}`
  document.getElementById(contentId).classList.add(theme.classes.editor.currentLine)
  document.getElementById(numberId).classList.add(theme.classes.editor.currentLineNumber)

  previousLine = currentLine
}

const LnNumber = withTheme(styled('span')({
  color: 'grey',
  marginRight: '35px',
  userSelect: 'none',
  textAlign: 'right',
  width: '30px',
}))

const LnContent = withTheme(styled('div')({
  display: 'flex',
  width: '100%',  
}))

const StyledLine = withTheme(styled('div')({
  display: 'flex',
  paddingLeft: '10px',
}))

const Line = props => {
  const {
    editorBlock,
    number,
  } = props

  // get ContentBlock for this editorBlock
  const contentBlock = editorBlock.props.children.props.block
  const text = contentBlock.getText()
  const key = contentBlock.getKey()
  
  // TODO lookup color of this editor block in symbol table
  const isEmpty = text.trim() === ''

  const onLnClick = () => {
    console.log(`Solo/Mute: Ln${number+1} (${key})`)
  }

  const lnNumId     = `${LineClassNames.LineNumber}-${key}`
  const lnContentId = `${LineClassNames.LineContent}-${key}`
  
  return (
    <StyledLine>
      <LnNumber className={LineClassNames.LineNumber} id={lnNumId} onClick={onLnClick} contentEditable={false}>
        { number+1 }
      </LnNumber>
      <LnContent className={LineClassNames.LineContent} id={lnContentId}>
        { editorBlock }
      </LnContent>
    </StyledLine>
  )
}

/**
 * a wrapper component for all editor blocks.
 *
 * @description each editor block in the DraftJS editor represents a single
 * statement in alea-lang. this block wrapper styles each statement according
 * to its statement type (e.g. variable assignement, import statement, sequence
 * execution, etc). 
 *
 */
export const LineBlock = props => (
  <div>
    { props.children.map((editorBlock, ln) => <Line key={ln} number={ln} editorBlock={editorBlock}/>) }
  </div>
)
