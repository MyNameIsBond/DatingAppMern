import React, { Component } from 'react'
import '../style/App.css'
import Chat from './Chat.jsx'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      username: false,
      knowUser: false
    }
  }
  componentWillMount = () => {
    if (localStorage.username) {
      this.setState({ knowUser: true })
      this.setState({ username: localStorage.username })
    }
  }
  usernameFunc = e => {
    console.log(e.target.value)
    this.setState({ username: e.target.value })
  }

  usernameFuncPress = e => {
    if (e.key === 'Enter') {
      this.setState({ knowUser: true })
      localStorage.setItem('username', e.target.value)
    }
  }
  render() {
    const { username, knowUser } = this.state
    return (
      <div>
        {knowUser ? (
          <Chat username={this.state.username} />
        ) : (
          <div className="usernameDiv">
            <h2>Welcome, give us your username</h2>
            <h2>{username ? username : 'username'}</h2>
            <div class="inputDiv">
              <input type="text" onKeyPress={this.usernameFuncPress} onChange={this.usernameFunc} />
            </div>
          </div>
        )}
      </div>
    )
  }
}
export default App
