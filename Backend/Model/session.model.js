
'use strict';

/**
 * @class Session
 * modulerar en session  
 */
class Session {
  // gamedata=[{username,score,hand},..]
  constructor(roomID, czar, gameData, blackCard=null, roundsPlayed=0) {
    this.roomID = roomID;
    this.czar = czar;
    this.gameData = gameData;
    this.roundsPlayed = roundsPlayed;
    this.blackCard= blackCard;
  }
}

module.exports = Session;
