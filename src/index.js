import React from 'react'
import ReactDOM from 'react-dom'
import CssBaseline from '@material-ui/core/CssBaseline'

import { CustomThemeProvider } from './ui/themes/provider'
import App from './ui/app'
import './index.css'


ReactDOM.render(
  <React.StrictMode>
    <CustomThemeProvider>
      <CssBaseline />
      <App />
    </CustomThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
