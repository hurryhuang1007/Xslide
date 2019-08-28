import React from 'react'
import Init from '../Init/Index'

export default class App extends React.Component {
  state = {
    tilePath: null
  }

  render() {
    return this.state.tilePath ? <h1>1</h1> : <Init inputFn={console.log} />
  }
}
