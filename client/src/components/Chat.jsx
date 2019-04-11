import React, { Component } from 'react'
import { Person, Search } from '@material-ui/icons'
export default class Chat extends Component {
  constructor(props) {
    super(props)
    this.state = {
      username: this.props
    }
  }
  render() {
    return (
      <div class="body">
        <div class="user">
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
          <div class="usersOnline">
            <img src={require('../photos/userPic.png')} />

            <p>Hey love</p>
          </div>
        </div>
        {/* Chat Grid */}
        <div>
          <div>Dolores La Flipe</div>
          <h2>hey</h2>
        </div>
      </div>
    )
  }
}
