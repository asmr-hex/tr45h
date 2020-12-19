import React from 'react'


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
        props.children.map(editorBlock => {
          // get ContentBlock for this editorBlock
          const contentBlock = editorBlock.props.children.props.block
          const text = contentBlock.getText()
          const key = contentBlock.getKey()

          // TODO lookup color of this editor block in symbol table
          const isEmpty = text.trim() === ''
          

          const style = {
            borderLeft: `3px ${isEmpty ? '#ffffff00' : interpreter.mem.getMetaData(key).color} solid`,
            paddingLeft: '10px',
          }        

          return <div key={key} style={style}>{editorBlock}</div>
        })
      }
    </div>
  )
}
