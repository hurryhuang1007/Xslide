import React from 'react'
import { Button } from '@material-ui/core'
import { Inbox, Refresh, RotateLeft, RotateRight, Collections } from '@material-ui/icons'
import { selectFile } from '../../core'
import './Index.css'

export default class Main extends React.Component {
  _selectFile = () => selectFile(this.props.inputFn)

  render() {
    return (
      <div className='Main'>
        <div className='Main-bar'>
          <div>
            <Button className='Main-btn' style={{ width: '150px', color: '#40a9ff' }} onClick={this._selectFile}>
              <Inbox className='Main-btn-icon-with-text' />open...
            </Button>
          </div>

          <div>
            <Button className='Main-btn'><Refresh /></Button>
            <Button className='Main-btn'><RotateLeft /></Button>
            <Button className='Main-btn'><RotateRight /></Button>
          </div>

          <div className='Main-bar-end'>
            <Button className='Main-btn'><Collections /></Button>
          </div>
        </div>
      </div>
    )
  }
}