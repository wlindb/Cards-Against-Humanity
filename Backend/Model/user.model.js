
'use strict';

/**
 * @class User
 * modulerar en user, todo se över fälten, behövs det flera? 
 */
class User {
  constructor(username) {
    this.socket = null;
    this.currentRoom = null;
    this.username = username;
    this.ready = false;
    this.timedOut = false;
    this.timeOutReference = null;
  }
}

module.exports = User;
