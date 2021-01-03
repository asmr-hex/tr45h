import React from 'react'


export const SettingsPage = props => {
  return (
    <div>
      {props.name}
      <div>
        <ul>
          {props.commands.map(
            c => <li>{c.name}</li>
          )}
        </ul>
      </div>
    </div>
  )
}
