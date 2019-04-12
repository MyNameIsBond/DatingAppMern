import React, { Component } from 'react'
import { Person, Search } from '@material-ui/icons'
export default class Chat extends Component {
  constructor(props) {
    super(props)
    this.state = {
      username: this.props,
      message: ''
    }
  }
  sendMessage = () => {
    console.log('lol')
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
          <div>this is the info</div>
          <div class="messageInfo" />
          <div>Dolores La Flipe</div>
          <h2>hey</h2>
          <div class="sendMessage">
            <input
              type="text"
              placeholder="Type a message..."
              onChange={e => {
                this.setState({ message: e.target.value })
              }}
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
