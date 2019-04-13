import React, { Component } from 'react'
import { Person, Search, CameraAlt, Videocam } from '@material-ui/icons'
import socketIOClient from 'socket.io-client'
const url = 'http://localhost:8080'
const socket = socketIOClient(url)
export default class Chat extends Component {
  constructor(props) {
    super(props)
    this.state = {
      username: this.props.username,
      message: '',
      socket: '',
      messages: []
    }
  }
  componentWillMount = () => {
    const { username } = this.state
    if (username) {
      this.userLoggedIn(username)
    }
  }

  userLoggedIn = username => {
    socket.emit('newUser', { username: username })
  }

  componentDidMount = () => {
    socket.on('newUser', data => {
      console.log(data)
    })
    socket.on('messages', message => {
      const { messages } = this.state
      const newMessages = [...messages, message]
      this.setState({ messages: newMessages })
    })
  }
  Messages = () => {
    const { messages } = this.state
    console.log(messages)
    const mes = messages.map(message => (
      <div>
        <p> {message.sender}</p>
        <p> {message.message}</p>
      </div>
    ))
    return mes
  }

  sendMessageEnter = e => {
    if (e.key === 'Enter') {
      this.sendMessage(this.state.message)
    }
  }
  sendMessage = message => {
    const { username } = this.state
    socket.emit('messages', { sender: username, message: message })
    this.setState({ message: '' })
  }

  camera = () => {
    console.log('camera')
  }

  video = () => {
    console.log('video')
  }

  render() {
    const { message } = this.state
    return (
      <div class="body">
        <div class="user">
          <div class="userInfo">
            <div class="userConainer">
              <div class="userInfoContainer">
                <Person />
                <p>{this.props.username}</p>
              </div>
            </div>
            <div class="searchContainer">
              <div class="inputContainer">
                <Search fontSize="small" />
                <input type="text" />
              </div>
            </div>
          </div>
          <div class="usersOnlineDiv">
            <div class="usersOnline">
              <img src={require('../photos/userPic.png')} alt="lol" />
              <div>
                <h4 class="chatName">Dolores La Flipo</h4>
                <p class="chatMessage">Hello there</p>
              </div>
            </div>
          </div>
        </div>
        {/* Chat Grid */}
        <div class="chatGrid">
          <div class="chatInfo">
            <div class="infoIconDiv">
              <CameraAlt onClick={this.camera} />
              <Videocam onClick={this.video} />
            </div>
          </div>
          <div class="messageInfo" />
          <this.Messages />
          <div>Dolores La Flipe</div>
          <div class="sendMessage">
            <input
              type="text"
              placeholder="Type a message..."
              onChange={e => {
                this.setState({ message: e.target.value })
              }}
              onKeyPress={this.sendMessageEnter}
              value={this.state.message}
            />
            <button type="submit" disabled={message ? false : true} onClick={this.sendMessage}>
              Send
            </button>
          </div>
        </div>
      </div>
    )
  }
}
