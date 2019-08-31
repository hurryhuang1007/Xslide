import React from 'react'
import { ErrorOutline, InfoOutlined } from '@material-ui/icons'
import { Tooltip } from '@material-ui/core'
import { CubeGrid } from 'better-react-spinkit'
import './Index.css'

export function StateCover(props) {
  return (
    <div className='StateCover' style={{ display: props.loaded ? 'none' : false }}>
      <div style={{ height: '30%' }} />
      <div style={{ display: props.inited ? false : 'none', height: '70%' }}>
        <div style={{ display: props.error ? 'none' : false, height: '100%' }}>
          <div style={{ width: '100px', height: '100px', margin: 'auto' }}><CubeGrid color='#40a9ff' size={100} col={4} row={4} /></div>
          <div style={{ height: '8%' }} />
          <h1>loading...</h1>
        </div>

        {
          props.error
            ? <div style={{ height: '100%' }}>
              <ErrorOutline style={{ fontSize: '90px' }} />
              <div style={{ height: '10%' }} />
              <p>Oops...Something going wrong...</p>
              <p>The reason may be one of the following:</p>
              <p>1.This file is not supported...</p>
              <p>2.This file is corrupt...</p>
              <p>3.This software happened to be wrong, please try again...</p>
              <p>
                4.It may be that I wrote a bug, you can try to submit an issue on my github.<br />
                Link: https://github.com/hurryhuang1007/Xslide
              </p>
              <p>More information: <Tooltip placement='bottom' title={props.error}><InfoOutlined style={{ verticalAlign: 'middle' }} /></Tooltip></p>
            </div>
            : undefined
        }
      </div>
    </div>

  )
}