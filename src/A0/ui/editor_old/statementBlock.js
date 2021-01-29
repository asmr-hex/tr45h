import React from 'react'
import { withTheme, styled } from "@material-ui/core/styles"


const LnNumber = withTheme(styled('span')({
  color: 'grey',
  marginRight: '35px',
  contentEditable: false,  // TODO figure this out...its not working (can still select line numbers...)
  userSelect: 'none',
}))

/**
 * a wrapper component for all editor blocks.
 *
 * @description each editor block in the DraftJS editor represents a single
 * statement in alea-lang. this block wrapper styles each statement according
 * to its statement type (e.g. variable assignement, import statement, sequence
 * execution, etc). 
 *
 * TODO style black w.r.t. their statement types
 */
export const StatementBlock = props => {
  // TODO destructure theme from props if needed
  const { interpreter } = props
  return (
    <div>
      {
        props.children.map((editorBlock, ln) => {
          // get ContentBlock for this editorBlock
          const contentBlock = editorBlock.props.children.props.block
          const text = contentBlock.getText()
          const key = contentBlock.getKey()
          
          // TODO lookup color of this editor block in symbol table
          const isEmpty = text.trim() === ''


          const style = {
            display: 'flex',
            borderLeft: `3px ${isEmpty ? '#ffffff00' : interpreter.mem.getMetaData(key).color} solid`,
            paddingLeft: '10px',
          }        

          const onLnClick = () => {
            console.log(`Solo/Mute: Ln${ln+1} (${key})`)
          }
          
          return (
            <div key={key} style={style}>
              <LnNumber onClick={onLnClick}>{ln+1}</LnNumber>
              {editorBlock}
            </div> 
          )
        })
      }
    </div>
  )
}
