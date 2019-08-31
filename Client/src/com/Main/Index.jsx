import React from 'react'
import { Tooltip, Button } from '@material-ui/core'
import { Inbox, Refresh, RotateLeft, RotateRight, Collections } from '@material-ui/icons'
import { selectFile } from '../../core'
import Viewer from '../Viewer/Index'
import './Index.css'

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
            <Tooltip title='Rotate 90° counterclockwise'><Button className='Main-btn'><RotateLeft /></Button></Tooltip>
            <Tooltip title='Rotate 90° clockwise'><Button className='Main-btn'><RotateRight /></Button></Tooltip>
          </div>

          <div className='Main-bar-end'>
            <Tooltip title='Save the current display image to...'><Button className='Main-btn'><Collections /></Button></Tooltip>
          </div>
        </div>

        <Viewer ref='viewer' {...this.state} tilePath={this.props.tilePath} />
      </div>
    )
  }
}