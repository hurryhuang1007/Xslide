import React from 'react'
import { Inbox } from '@material-ui/icons'
import { eventPreventDefault, selectFile } from '../../core'
import './Index.css'

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

  _click = () => selectFile(this.props.inputFn)

  render() {
    return (
      <div className='Init'>
        <div style={{ paddingTop: '40vh' }}>
          <Inbox fontSize='large' style={{ fontSize: '85px', color: '#40a9ff' }} />
          <h2>Click or drag file to this area to view</h2>
          <p>Support tif, svs, mrxs, bif, hdpi, vms, vmu, jpg and png file(s)</p>
          <p>scn, tiff and svslide are also theoretically supported, but it has not been confirmed.</p>
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
