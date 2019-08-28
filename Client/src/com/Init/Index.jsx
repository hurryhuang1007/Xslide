import React from 'react'
import { Inbox } from '@material-ui/icons'
import { eventPreventDefault, supportFileType } from '../../core'
import './Index.css'

const remote = global.nodeRequire('electron').remote

export default class Init extends React.Component {
  _dragEnter = e => {
    e.preventDefault()
    this.refs.cover.classList.add('Init-cover-drag-over')
  }

  _dragLeave = e => {
    this.refs.cover.classList.remove('Init-cover-drag-over')
  }

  _drop = e => {
    this.refs.cover.classList.remove('Init-cover-drag-over')
    let files = e.dataTransfer.files
    files && files[0] && files[0].path && this.props.inputFn(files[0].path)
  }

  _click = () => {
    let paths = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
      properties: ['openFile'],
      filters: [
        { name: 'Support File Type', extensions: supportFileType },
        { name: 'All Files', extensions: ['*'] }
      ]
    })
    if (!paths || !paths[0]) return
    this.props.inputFn(paths[0])
  }

  render() {
    return (
      <div className='Init'>
        <div style={{ paddingTop: '40vh' }}>
          <Inbox fontSize='large' style={{ fontSize: '85px' }} />
          <h2>Click or drag file to this area to view</h2>
          <p>Support tiff, svs, mrxs, jpg and png file(s)</p>
        </div>

        <div className='Init-cover' ref='cover'
          onDragEnter={this._dragEnter}
          onDragOver={eventPreventDefault}
          onDragLeave={this._dragLeave}
          onDrop={this._drop}
          onClick={this._click}
        />
      </div>
    )
  }
}
