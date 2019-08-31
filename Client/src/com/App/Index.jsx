import React from 'react'
import { supportFileType, getFileTypeByURL } from '../../core'
import Init from '../Init/Index'
import Main from '../Main/Index'
const remote = global.nodeRequire('electron').remote

export default class App extends React.Component {
  state = {
    tilePath: null
  }

  _fileInput = tilePath => {
    if (!supportFileType.includes(getFileTypeByURL(tilePath))) {
      if (
        remote.dialog.showMessageBox(remote.getCurrentWindow(), {
          type: 'warning',
          title: 'Unsupported File Type',
          message: 'This file type may not be supported, are you sure continue to open?',
          buttons: ['yes', 'no'],
          defaultId: 0,
          cancelId: 1
        }) === 1
      ) return
    }
    this.setState({ tilePath })
  }

  render() {
    return this.state.tilePath ? <Main inputFn={this._fileInput} tilePath={this.state.tilePath} /> : <Init inputFn={this._fileInput} />
  }
}
