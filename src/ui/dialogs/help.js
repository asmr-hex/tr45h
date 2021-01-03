import React from 'react'
import { flatMap, map, max, range, values, uniq } from 'lodash'


export const HelpPage = props => {
  const { commands } = props

  const overview = [
    `alea-0 :: aleatoric, sample-based, instrument & programming language.`,
    `this console will help you play and learn.`,
    `playing & learning are important for us all.`,
    `particularly when they lead you to compassionate action.`
  ]

  const getMaxSubCommands = cmds => max(map(
    cmds,
    c => {
      const subcmds = uniq(values(c.subcommands))
      if (subcmds.length === 0) return 1
      return getMaxSubCommands(subcmds) + 1
    }
  ))
  const tableWidth = getMaxSubCommands(commands) + 1
  

  const createCommandRow = (c, col) =>
        <tr>
        {map(
          range(tableWidth),
          i => i === col
            ? <td>{c.name}</td>
            : i === (tableWidth -1) ? <td>{c.description}</td> : <td></td>
        )}
        </tr>
  const createCmdRows = (cmds, col=0) => flatMap(
    cmds,
    c => {
      return [createCommandRow(c, col), ...createCmdRows(uniq(values(c.subcommands)), col+1)]
    }
  )
  const commandTable = createCmdRows(commands)

  console.log(commandTable)
        
  return (
    <div>
      {props.name}
      <div>
        {overview}
        <table>
          <tbody>
            {commandTable}
          </tbody>
        </table>
      </div>
    </div>
  )
}
