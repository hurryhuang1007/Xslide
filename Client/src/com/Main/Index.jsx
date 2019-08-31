import React from 'react'
import { Tooltip, Button } from '@material-ui/core'
import { Inbox, Refresh, RotateLeft, RotateRight, Collections } from '@material-ui/icons'
import { selectFile, getFileTypeByURL, blob2BufferAsync } from '../../core'
import Viewer from '../Viewer/Index'
import './Index.css'
const remote = global.nodeRequire('electron').remote
const fs = global.nodeRequire('fs')

export default class Main extends React.Component {
  componentDidMount() {
    window.addEventListener('resize', this._resize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._resize)
  }

  state = {
    layoutWidth: window.innerWidth,
    layoutHeight: window.innerHeight - 50
  }

  _resize = () => this.setState({
    layoutWidth: window.innerWidth,
    layoutHeight: window.innerHeight - 50
  })

  _selectFile = () => selectFile(this.props.inputFn)

  _reset = () => this.refs.viewer.resetPosition()

  _counterclockwise = () => this.refs.viewer.rotate(false)

  _clockwise = () => this.refs.viewer.rotate(true)

  _save = async () => {
    let path = remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
      filters: [
        { name: 'JPG Image', extensions: ['jpg', 'jpeg'] },
        { name: 'PNG Image', extensions: ['png'] },
        { name: 'WEBP Image', extensions: ['webp'] },
        { name: 'Images', extensions: ['jpg', 'png', 'webp'] }
      ]
    })
    if (!path) return
    let type = getFileTypeByURL(path)
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(type)) return remote.dialog.showErrorBox('Save Image Type Error!', 'Please choose jpg/png/webp image type to save.')
    let blob = await this.refs.viewer.getImageBlobAsync(type)
    fs.writeFile(path, await blob2BufferAsync(blob), e => { if (e) remote.dialog.showErrorBox('Save Image Error!', 'Please choose other image type to save.') })
  }

  render() {
    return (
      <div className='Main'>
        <div className='Main-bar'>
          <div>
            <Tooltip title='Open new image'>
              <Button className='Main-btn' style={{ width: '150px', color: '#40a9ff' }} onClick={this._selectFile}>
                <Inbox className='Main-btn-icon-with-text' />open...
              </Button>
            </Tooltip>
          </div>

          <div>
            <Tooltip title='Reset position and zoom'><Button className='Main-btn' onClick={this._reset}><Refresh /></Button></Tooltip>
            <Tooltip title='Rotate 90° counterclockwise'><Button className='Main-btn' onClick={this._counterclockwise}><RotateLeft /></Button></Tooltip>
            <Tooltip title='Rotate 90° clockwise'><Button className='Main-btn' onClick={this._clockwise}><RotateRight /></Button></Tooltip>
          </div>

          <div className='Main-bar-end'>
            <Tooltip title='Save the current display image to...'><Button className='Main-btn' onClick={this._save}><Collections /></Button></Tooltip>
          </div>
        </div>

        <Viewer ref='viewer' {...this.state} tilePath={this.props.tilePath} />
      </div>
    )
  }
}