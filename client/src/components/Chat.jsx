import React, { Component } from 'react'
import { Accept } from './dropFile.jsx'
import { Search, CameraAlt, Videocam, Group } from '@material-ui/icons'
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
      messages: [],
      users: [],
      fileUpload: false
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
      const { users } = this.state
      const nUsers = [...users, data]
      this.setState({ users: nUsers })
    })
    socket.on('messages', message => {
      const { messages } = this.state
      const newMessages = [...messages, message]
      this.setState({ messages: newMessages })
    })
  }
  Messages = () => {
    const { messages, username } = this.state
    console.log(username)
    const mes = messages.map(message => (
      <div class={username === message.sender ? 'recievedMessage' : 'messageDiv'}>
        <img title={message.sender} src={require(`../photos/${message.sender}.png`)} />
        <div>
          <p> {message.message}</p>
          <small> {message.date}</small>
        </div>
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
    const currentDate = new Date()
    const hour = currentDate.getHours()
    const minute = currentDate.getMinutes()
    const datee = `${hour}:${minute}`
    socket.emit('messages', { sender: username, message: message, date: datee })
    this.setState({ message: '' })
  }

  video = () => {
    console.log('video')
  }

  Users = () => {
    const { users } = this.state
    const usersS = users.map(user => (
      <div class="usersOnline">
        <img src={require(`../photos/${user.username}.png`)} />
        <div>
          <h4 class="chatName">{user.username}</h4>
          <p class="chatMessage">Online now</p>
        </div>
      </div>
    ))
    return usersS
  }

  NoUser = () => (
    <div class="noUsersOnline">
      <Group />
      <p>No users online</p>
    </div>
  )

  render() {
    const { message, fileUpload, username, users } = this.state
    return (
      <div class="body">
        <div class="userDiv">
          <div class="user">
            <div class="userInfo">
              <div class="userConainer">
                <div class="userInfoContainer">
                  <img src={require(`../photos/${username}.png`)} alt="lol" />
                  <p>{this.props.username}</p>
                </div>
              </div>
              <div class="searchContainer">
                <div class="inputContainer">
                  <Search fontSize="small" />
                  <input type="text" placeholder="Search for users..." />
                </div>
              </div>
            </div>
            <div class="usersOnlineDiv">{!users.length ? <this.NoUser /> : <this.Users />}</div>
          </div>
        </div>
        {/* Chat Grid */}
        <div class="chatGrid">
          <div class="chatInfo">
            <div class="infoIconDiv">
              <div class="userChatInfo">
                <img src={require('../photos/userPic.png')} alt="lol" />
                <p>James Bond</p>
              </div>
              <CameraAlt
                onClick={() => {
                  this.setState({ fileUpload: !fileUpload })
                }}
              />
              <Videocam onClick={this.video} />
            </div>
          </div>
          <div class="messageInfo">
            <this.Messages />
          </div>
          <div
            hidden={fileUpload ? false : true}
            class={`dropDiv ${fileUpload ? 'dropDivGb' : null}`}
          />
          <div>{fileUpload ? <Accept /> : null}</div>
          <div class="sendMessage">
            <input
              onDragEnter={e => {
                this.setState({ fileUpload: true })
              }}
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
