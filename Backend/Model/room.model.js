
'use strict';

/**
 * @class Room
 * modulerar ett room 
 */
class Room {
  constructor(roomID, roomName, host) {
    this.roomID = roomID;
    this.roomName = roomName;
    this.host = host;
    this.playersInRoom = 0;
  }
}

module.exports = Room;
