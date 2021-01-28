import React from 'react'

import logo from '../logo/logo-white.svg'


export const ExperimentalLogo = props => {
  const {
    width  = 300,
    height = 300,
    style  = {},
  } = props

  const defaultStyle = {
    border: 'white 1px dashed',
    margin: '10px',
    ...style,
  }

  const cc      = width / 2
  const cradius = (width * 0.8) / 2
  const cfill   = '#ffffff'

  const qbcurve = y => `
   M ${width * 0.2},${y}
   Q ${10},${80} ${60},${y}
   t 120,0 120,0
  `
  
  return (
    <svg style={defaultStyle} width={width} height={height}>
      <circle cx={cc} cy={cc} r={cradius} fill={cfill} />
      <g>
        <path d={qbcurve(cc)} fill={'green'}/>
      </g>
    </svg>
  )
}

export const Logo = props => {
  const style = {
    height: '15px',
    margin: '0.2%',
    objectFit: 'fill'
  }

  return (
    <img src={logo} style={style}/>
  )
}
