import React from 'react'
import { Inbox } from '@material-ui/icons'
import './Index.css'

export default function Init(props) {
  return (
    <div className='Init'>
      <div style={{ marginTop: '40vh' }}>
        <Inbox style={{ fontSize: '85px' }} />
        <h2>Click or drag file to this area to view</h2>
        <p>Support tiff, svs and mrxs file(s)</p>
      </div>
    </div>
  )
}