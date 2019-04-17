import React, { Component } from 'react'
import { css } from '@emotion/core'
import { ClipLoader } from 'react-spinners'
import isUrl from 'is-url'
import ReactPlayer from 'react-player'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import {
  Search,
  CameraAlt,
  Videocam,
  Group,
  WbSunny,
  Brightness3,
  Translate
} from '@material-ui/icons'
import update from 'react-addons-update'
import ClickToEdit from 'react-click-to-edit'
import socketIOClient from 'socket.io-client'
import translate from 'translate'
translate.engine = 'yandex'
translate.key =
  'trnsl.1.1.20190416T055045Z.8cfbe4ca823ac3e3.ee12f4989798a0b3a198c0291000620690146c67'
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
      fileUpload: false,
      theme: true,
      loading: false,
      newPicture: false
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
      const { users } = this.state
      const nUsers = [...users, data]
      this.setState({ users: nUsers })
    })
    socket.on('messages', message => {
      const { messages } = this.state
      const newMessages = [...messages, message]
      this.setState({ messages: newMessages })
    })

    socket.on('onEdit', edited => {
      this.setState({ messages: edited })
    })
  }
  Messages = () => {
    const { messages, username } = this.state
    const mes = messages.map((message, i) => {
      switch (message.condition) {
        case 'message':
          return <this.TextMessage message={message} value={i} />
        case 'video':
          return <this.VideoMessage message={message} value={i} />
        case 'picture':
          return <this.PictureMessage message={message} value={i} />
      }
    })
    return mes
  }

  TextMessage = props => {
    const { username, messages } = this.state
    const { message, value } = props

    return (
      <div
        value={value}
        onDoubleClick={e => {
          if (e.shiftKey && message.sender === username) {
            messages.splice(value, 1)
            this.setState({ messages: messages })
            socket.emit('onEdit', messages)
          }
        }}
        class={username === message.sender ? 'recievedMessage' : 'messageDiv'}
      >
        <img title={message.sender} src={require(`../photos/${message.sender}.png`)} />
        <div
          title={
            username === message.sender
              ? `shift + double click to delete: ${message.message}`
              : `${message.message}`
          }
        >
          <p>
            {username === message.sender ? (
              <ClickToEdit
                wrapperClass="wrapperClase"
                inputClass="inputClass"
                textClass="textClass"
                value={message.message}
                endEditing={e => {
                  this.setState(
                    {
                      messages: update(this.state.messages, {
                        [`${value}`]: { message: { $set: e } }
                      })
                    },
                    () => socket.emit('onEdit', this.state.messages)
                  )
                }}
              />
            ) : (
              `${message.message}`
            )}
          </p>
          <div class="messageItems">
            <small>{message.date}</small>
            {!(username === message.sender)
              ? [
                  !message.loading ? (
                    <Translate
                      onClick={async e => {
                        this.setState({
                          messages: update(this.state.messages, {
                            [`${value}`]: { loading: { $set: true } }
                          })
                        })
                        const text = await translate(`${message.message}`, 'pt')
                        this.setState({
                          messages: update(this.state.messages, {
                            [`${value}`]: { message: { $set: text } }
                          })
                        })
                        this.setState({
                          messages: update(this.state.messages, {
                            [`${value}`]: { loading: { $set: false } }
                          })
                        })
                      }}
                    />
                  ) : (
                    <div class="loading">
                      <ClipLoader
                        css={css}
                        sizeUnit={'px'}
                        size={15}
                        color={'var(--iconColour)'}
                        loading={message.loading}
                      />
                    </div>
                  )
                ]
              : null}
          </div>
        </div>
      </div>
    )
  }
  sendMessageEnter = e => {
    if (e.key === 'Enter') {
      this.sendMessage()
    }
  }
  sendMessage = () => {
    const { username, message, newPicture } = this.state
    const currentDate = new Date()
    const hour = currentDate.getHours()
    const minute = currentDate.getMinutes()
    const datee = `${hour}:${minute}`
    if (this.state.newPicture !== false) {
      socket.emit('messages', {
        condition: 'picture',
        sender: username,
        message: message,
        url: newPicture,
        date: datee,
        loading: false,
        locked: false
      })
      this.setState({ newPicture: false })
      this.setState({ message: '' })
    } else if (isUrl(message)) {
      socket.emit('messages', {
        condition: 'video',
        sender: username,
        url: message,
        date: datee,
        loading: false,
        playing: false,
        volume: 20
      })
    } else {
      socket.emit('messages', {
        condition: 'message',
        sender: username,
        message: message,
        date: datee,
        loading: false
      })
    }
    this.setState({ message: '' })
  }

  video = () => {
    const { message } = this.state
    if (isUrl(message)) {
      this.sendMessage()
    }
  }
  VideoMessage = props => {
    const { username, messages } = this.state
    const { message, value } = props
    return (
      <div
        onDoubleClick={e => {
          if (e.shiftKey && message.sender === username) {
            messages.splice(value, 1)
            this.setState({ messages: messages })
            socket.emit('onEdit', messages)
          }
        }}
        class={username === message.sender ? 'sendVideo' : 'recieveVideo'}
      >
        <img title={message.sender} src={require(`../photos/${message.sender}.png`)} />
        <ReactPlayer
          className="player"
          url={message.url}
          onStart={() => {
            this.setState({
              messages: update(this.state.messages, {
                [`${value}`]: { playing: { $set: true } }
              })
            })
            socket.emit('onEdit', this.state.messages)
          }}
          onPlay={() => {
            this.setState({
              messages: update(this.state.messages, {
                [`${value}`]: { playing: { $set: true } }
              })
            })
            socket.emit('onEdit', this.state.messages)
          }}
          onPause={() => {
            this.setState({
              messages: update(this.state.messages, {
                [`${value}`]: { playing: { $set: false } }
              })
            })
            socket.emit('onEdit', this.state.messages)
          }}
          playing={message.playing}
          height="200px"
          width="400px"
        />
      </div>
    )
  }
  PictureMessage = props => {
    const { username, messages } = this.state
    const { message, value } = props
    return (
      <div
        onDoubleClick={e => {
          if (e.shiftKey && message.sender === username) {
            messages.splice(value, 1)
            this.setState({ messages: messages })
            socket.emit('onEdit', messages)
          }
        }}
        class={message.sender === username ? 'sendPicture' : 'recievePic'}
      >
        <img class="sendPic" src={message.url} />
        <img class="userPic" src={require(`../photos/${message.sender}.png`)} />
        <small>{message.message}</small>
      </div>
    )
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
  changeTheme = () => {
    const { theme } = this.state
    const doc = document.documentElement.style
    if (theme === false) {
      // Light Theme
      doc.setProperty('--bgColour', '#ebebeb')
      doc.setProperty('--normalTextColour', '#424244')
      doc.setProperty('--textInDecoration', '#ebebeb')
      doc.setProperty('--border', 'lightgray')
      doc.setProperty('--hoverColour', 'lightgray')
      doc.setProperty('--singleDecorationColour', '#ff4b01')
      doc.setProperty('--iconColour', 'rgb(82, 82, 82)')
      doc.setProperty('--lightText', 'rgb(161, 161, 161)')
      doc.setProperty(
        '--decorationColor',
        'linear-gradient(139deg, #fb8817, #ff4b01, #c12127, #e02aff)'
      )
      doc.setProperty('--recieveMessageColour', '#d84315')

      this.setState({ theme: true })
    } else {
      // Dark Theme
      doc.setProperty('--bgColour', '#212121')
      doc.setProperty('--normalTextColour', '#BDBDBD')
      doc.setProperty('--border', '#424242')
      doc.setProperty('--hoverColour', '#37474F')
      doc.setProperty('--iconColour', '#26A69A')
      doc.setProperty('--textInDecoration', '#ebebeb')
      doc.setProperty('--lightText', '#9E9E9E')
      doc.setProperty('--singleDecorationColour', '#1DE9B6')
      doc.setProperty(
        '--decorationColor',
        'linear-gradient(139deg, #1DE9B6,#00695C, #004D40,#00796B)'
      )
      doc.setProperty('--recieveMessageColour', '#009688')

      this.setState({ theme: false })
    }
  }

  Accept = () => {
    const {
      getRootProps,
      getInputProps,
      isDragActive,
      isDragAccept,
      isDragReject,
      acceptedFiles
    } = useDropzone({
      accept: 'image/jpeg, image/png'
    })
    const data = new FormData()
    acceptedFiles.forEach(async file => {
      data.append('files', file)
      const res = await axios.post('/picture', data)
      this.setState({ fileUpload: false })
      this.setState({ newPicture: res.data.path })
      this.setState({ message: file.path })
    })
    return (
      <div className="container">
        <div {...getRootProps({ className: 'dropzone' })}>
          <input {...getInputProps()} />
          {isDragAccept && <p>All files will be accepted</p>}
          {isDragReject && <p>Some files will be rejected</p>}
          {!isDragActive && <p>Drop some files here ...</p>}
        </div>
      </div>
    )
  }

  NewPicture = () => {
    const { loading, newPicture } = this.state
    return (
      <div class="newPicture">
        {loading ? <p>loading</p> : <img src={newPicture} />}
        <button
          class="cancel"
          onClick={() => {
            this.setState({ newPicture: false })
            this.setState({ message: '' })
          }}
        >
          cancel
        </button>
        <button
          class="send"
          onClick={() => {
            const { username, message } = this.state
            const currentDate = new Date()
            const hour = currentDate.getHours()
            const minute = currentDate.getMinutes()
            const datee = `${hour}:${minute}`
            socket.emit('messages', {
              condition: 'picture',
              sender: username,
              message: message,
              url: newPicture,
              date: datee,
              loading: false
            })
            this.setState({ newPicture: false })
            this.setState({ message: '' })
          }}
        >
          send
        </button>
      </div>
    )
  }
  render() {
    const { message, fileUpload, username, users, theme, newPicture } = this.state
    return (
      <div class="body">
        <div class="userDiv">
          <div class="user">
            <div class="userInfo">
              <div class="userConainer">
                <div class="userInfoContainer">
                  <img src={require(`../photos/${username}.png`)} />
                  <p>{this.props.username}</p>
                  {theme ? (
                    <WbSunny onClick={this.changeTheme} />
                  ) : (
                    <Brightness3 onClick={this.changeTheme} />
                  )}
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
          <div>{fileUpload ? <this.Accept /> : null}</div>
          {newPicture ? <this.NewPicture /> : null}
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
