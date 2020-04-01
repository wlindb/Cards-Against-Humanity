'use strict';
const User = require('./Model/user.model');
const Room = require('./Model/room.model');
const Card = require('./Model/card.model');
const Session = require('./Model/session.model');
const db = require('./Database/database');

const users = {};
const rooms = {};
const whiteCards = {};
const blackCards = {};
const session = {};

/**
 * unregisteredSockets is used as a temporary pool of sockets
 * that belonging to users who are yet to login.
 */
let nextUnregisteredSocketID = 0;
let unregisteredSockets = {};

// Will be initialized in the exports.init function
exports.io = undefined;

/**
 * Initialize the model
 * @param { { io: SocketIO.Server} } config - The configurations needed to initialize the model.
 * @returns {void}
 */
exports.init = ({ io }) => {
  exports.io = io;
};



exports.initCards = () => {
    this.initWhiteCards();
    this.initBlackCards();
    // setTimeout(() => {
    //     console.log('\n\nwhiteCards= ', whiteCards);
    //     // console.log('\n\n\n\n\n\n\n\nblackCards= ', blackCards);
    // }, 2000);
};

exports.initWhiteCards = () => {
    db.answerCards.getWhiteCards()
    .then((whiteCards) => {
        whiteCards.map((card) => {
            const tmp = card.id.split('=');
            let cardset = tmp[2];
            const tmp2 = tmp[1].split(',');
            const id = tmp2[0];
            cardset = JSON.parse(cardset);
            this.addCard(id,cardset,card.answer,true);
        });
    });
};

exports.initBlackCards = () => {
    db.questionCards.getBlackCards()
    .then((blackCards) => {
        // console.log('\n\n\n\n\n\n\n\nblackCards= ', blackCards);
        blackCards.map((card) => {
            const tmp = card.id.split('=');
            let cardset = tmp[2];
            const tmp2 = tmp[1].split(',');
            const id = tmp2[0];
            cardset = JSON.parse(cardset);
            this.addCard(id,cardset,card.answer,false);
        });
    });
};

// white = true, black=false
exports.addCard = (id, cardset, text, whiteOrBlack) => {
    if ( whiteOrBlack ) {
        whiteCards[id] = new Card(id,cardset,text);
    } else {
        blackCards[id] = new Card(id,cardset,text);
    }
};

/**
 * Add a socket.io socket to the pool of unregistered sockets
 * @param {SocketIO.Socket} socket - The socket.io socket to add to the pool.
 * @returns {Number} The ID of the socket in the pool of unregistered sockets.
 */
exports.addUnregisteredSocket = (socket) => {
    // console.log('addUnregisteredSocket, socket = \n', socket);
    const socketID = nextUnregisteredSocketID;
    nextUnregisteredSocketID += 1;
    console.log('innan========');
    unregisteredSockets[socketID] = socket;
    // console.log('addUnregisteredSocket, unregisteredSockets = \n', unregisteredSockets);
    return socketID;
};

exports.assignNewSocketToUser = (username) => {
    users[username].socket = assignUnregisteredSocket(nextUnregisteredSocketID);
};


const assignUnregisteredSocket = (socketID) => {
    console.log('inne i assignUnregisteredSocket, socketID = ', socketID);
    // console.log('inne i assignUnregisteredSocket, unregisteredSockets = \n',unregisteredSockets);
    const socket = unregisteredSockets[socketID];
    unregisteredSockets = Object.keys(unregisteredSockets)
    .filter((sockID) => sockID !== socketID)
    .reduce((res, sockID) => ({ ...res, [sockID]: unregisteredSockets[sockID] }), {});
    return socket;
};

exports.addUser = (username,SocketID=undefined) => {
    users[username] = new User(username);
    if(SocketID !== undefined){
        console.log('inne i if');
        users[username].socket = assignUnregisteredSocket(SocketID);
        // console.log('users i adduser2', users);
    }
};

/**
 * Updated the socket associated with the user with the given name.
 * @param {String} name - The name of the user.
 * @param {SocketIO.Socket} socket - A socket.io socket.
 * @returns {void}
 */
exports.updateUserSocket = (username, socket) => {
    users[username].socket = socket;
};

/**
 * Returns the user object with the given name.
 * @param {String} username - The name of the user.
 * @returns {User}
 */
exports.findUser = (username) => {
    // console.log('\n\n=============================');
    // console.log('users: ', users);
    // console.log('\n\n=============================');
    return users[username]; 
};

exports.removeUser = (username) => users[username] = undefined;

/**
 * Returns all the users.
 * @returns {User}
 */
exports.getUsers = () => users;


exports.toggleUserReady = (username) => {
    console.log('toggleUserReady username: ', username);
    users[username].ready = !users[username].ready; 
}

exports.setUserRoomStatus = (username, bool) => {
    users[username].ready = bool;
}

// ===================================== ROOM FUNCTIONS =====================================
exports.initRoomList = () => {
    db.rooms.getRooms()
    .then((rooms) => {
        rooms.map((room) => {
            this.addRoom(room.room_id, room.room_name, room.host);
        });
    });
}

exports.addRoom = (roomID, roomName, host) => {
    rooms[roomID] = new Room(roomID, roomName, host);
};

exports.findRoom = (roomID) => rooms[roomID];

// #
exports.findRoomIDByUsername = (username) => {
    console.log('findrRoomByUsername session innan', session);
    let roomID = Object.values(session).map((session) => {
        const isInRoom = (session.gameData.filter(user => user.username === username).length > 0); // JSON.parse(session.gameData)
        if(isInRoom) {
            return session.roomID;
        }
    });
    console.log('roomID innan filer i findroomByUsername,', roomID);
    roomID = roomID.filter((room) => {
        return room != null;
    });
    console.log('findrRoomByUsername session efter', session);
    console.log('JAG ÄR ROOM ID :) ', roomID);
    return roomID[0];
};

exports.getRoomList = () => rooms;

exports.incrementPlayersInRoom = (roomID) => {
    if(rooms[roomID].playersInRoom < 4) {
        rooms[roomID].playersInRoom += 1;
    }
}; 

exports.decrementPlayersInRoom = (roomID) => {
    if(rooms[roomID].playersInRoom > 0) {
        rooms[roomID].playersInRoom -= 1;
    }
}; 
exports.setCurrentRoom = (username, roomID) => {
    console.log('inne i model setCurrentRoom');
    users[username].currentRoom = roomID;
};

exports.getPlayersInRoom = (roomID) => {
    console.log('inne i model getPlayersInRoom');
    const tempUsers = Object
    .values(users)
    .slice()
    .filter(usr => usr !== undefined)
    .map((user) => {
        return {currentRoom: user.currentRoom, username: user.username, ready:user.ready}
    })
    .filter((user) => {
        return user.currentRoom === roomID 
    });
    return tempUsers;
};


exports.unsubscribePlayersFromGame = (roomID, playersInGame) => {
    playersInGame.map(player => {
        const user = this.findUser(player);
        user.socket.leave(roomID.toString());
        this.setCurrentRoom(player, null);
        this.setUserRoomStatus(player, false);
    });
};

exports.destroyRoom = (roomID) => {
    db.rooms.destroyRoom(roomID)
    .then(() => {
        this.removeRoom(roomID);
        this.emitOnRoomUpdate();
    });
}; 

exports.removeRoom = (roomID) => {
    delete rooms[roomID.toString()];
};

// ===================================== Session FUNCTIONS =====================================
// TODO
exports.initSessions = () => {
    console.log('initSessions innan SESSION = ', session);
    db.sessions.getSessions()
    .then((sessions) => {
        console.log('sessions from init session', sessions);
        sessions.map((session) => {
            // console.log('session from init session', session);
            if(session !== null) {
                this.addSession(session.room_id, session.czar, session.gameData, session.blackCard, session.roundsPlayed);
            }
        });
        console.log('initSessions efter SESSION = ', session);
    });
}

exports.printSessions = () => {
    
    setTimeout(() => {
        console.log('=================== PRINT SESSION ===================');
        console.log(session)
        console.log('=================== ^^^^^^^^^^^^^ ===================');
    }, 3000);
};

exports.userInSession = (username) => {
    console.log('kör userInSession **************************************************************************');
    console.log('userInSession ', username);
    let inSession = false;
    console.log('session ', session);
    console.log('session values', Object.values(session));
    const userInSession = Object.values(session).filter((session) => {
        const userInGameData = session.gameData.filter((user) => {
            return user.username === username;
        });
        console.log('useringameData ', userInGameData);
        return userInGameData.length > 0;
    });
    console.log('userInSession ', userInSession);
    inSession = userInSession.length > 0;
    // inSession = Object.values(session).map((session) => {
    //     if(session.gameData === undefined) return false;
    //     console.log('INRE');
    //     console.log('',session.gameData);
    //     console.log(typeof(session.gameData));
    //     const userIsInSession = JSON.parse(session.gameData).filter((user) => user.username === username);
    //     console.log('userIsInSession', userIsInSession, ' size of kalle penis = ', userIsInSession.length, 'cm' );
    //     if(userIsInSession.length > 0) return true;
    //     return session;
    // });

    return inSession;
};

exports.addSession = (roomID, czar, gameData, blackCard, roundsPlayed=0) => {
    session[roomID] = new Session(roomID, czar, gameData, blackCard, roundsPlayed);
};

exports.findSession = (roomID) => session[roomID];

exports.createSession = (roomID, czar, blackCard) => {
    let gameData = Object.values(users).map((user) => {
        console.log('createSession inne i map user = ', typeof(user));
        if(user.currentRoom === roomID) {
            return {username: user.username, score:0, hand:[]};
        }
    })
    console.log('gameData from createSession före filter ', gameData);
    gameData = gameData.filter(usr => {
        return usr != null
    });
    console.log('gameData from createSession efter filter ', gameData);
    this.addSession(roomID,czar,gameData,blackCard);
    db.sessions.addSession(roomID, czar,gameData,0,blackCard)
    .catch(err => console.error(err));
};

exports.updatePlayerScore = (playedByUser, roomID) => {
    session[roomID].gameData.map((user) => { //  JSON.parse(session[roomID].gameData)
        if(user.username === playedByUser) {
            user.score++;
        }
        return user;
    }).filter(usr => usr !== null);
}

exports.saveSessionToDB = (roomID) => {
    const { czar, gameData, roundsPlayed, blackCard } = session[roomID]; 
    // room_id, czar, gameData, roundsPlayed, blackCard
    db.sessions.updateSession(roomID, czar, gameData, roundsPlayed, blackCard);
}; 

exports.initHand = (roomID, username) => {
    // lengt = 2038
    const hand = [];
    let id;
    for (let i = 0; i < 10; i++) {
        id = Math.floor(2038*Math.random());
        console.log('id = ', id);
        hand[i] = whiteCards[id];
    }
    console.log('HAND = ', hand);
    console.log('initHand session = ', session);
    session[roomID].gameData.map((user) => { //locally save hand
        if(user.username === username){
            user.hand = hand;
        }
        return user;
    }).filter(usr => usr !== null);
    // console.log('Session.gamedata', session[roomID].gameData);
    db.sessions.initHand(roomID, session[roomID].gameData);
    return hand;
}

exports.getBlackCard = () => {
    let id = Math.floor(540*Math.random());
    console.log('id = ', id);
    // Since kalle is a brainfuck coder
    while (blackCards[id] === undefined) {
        id = Math.floor(540*Math.random());
    }
    return blackCards[id];
}

exports.addCardToHand = (roomID, username) => {
    const id = Math.floor(2038*Math.random());
    const card = whiteCards[id];
    console.log('add card to hand innan: ', session[roomID].gameData);
    session[roomID].gameData.map((user) => {
        if(user.username === username){
            user.hand.push(card);
        }
    }).filter(usr => usr !== null);
    console.log('add card to hand innan: ', session[roomID].gameData);

    return card;
};


exports.removeCardFromHand = (roomID, cardPlayed, username) => {
    console.log(cardPlayed, username);
    console.log('rm card from hand innan: ', session[roomID].gameData);
    session[roomID].gameData.map((user) => { // JSON.parse(session[roomID].gameData)
        if(user.username === username){
            user.hand = user.hand.filter((card) => {
                return card.id !== cardPlayed.id;
            });
        }
        return user;
    }).filter(usr => usr !== null);
    console.log('rm card from hand: ', session[roomID].gameData);
};

exports.prepareNextRound = (roomID) => {
    session[roomID].roundsPlayed++;
    console.log('roundsPlayed= ', session[roomID].roundsPlayed);
    const nextCzarIndex = session[roomID].roundsPlayed % session[roomID].gameData.length;
    console.log('nextCzarIndex=', nextCzarIndex);
    console.log('innan session[roomID].czar', session[roomID].czar);
    session[roomID].czar = session[roomID].gameData[nextCzarIndex].username;
    console.log('efter session[roomID].czar', session[roomID].czar);
};

exports.destroySession = (roomID) => {
    db.sessions.destroySession(roomID)
    .then(() => {
        this.removeSession(roomID);
    });
};

exports.removeUserFromSession = (roomID, username) => {
    const newGameData = session[roomID].gameData.filter((usr) => {
        return usr.username !== username;
    }); 
    db.sessions.updateSession(roomID, session[roomID].czar, newGameData, session[roomID].roundsPlayed, session[roomID].blackCard)
    .then(() => {
        session[roomID].gameData = newGameData;
    });
}

exports.removeSession = (roomID) => {
    console.log('Model > removeSession > session Innan ', session);
    delete session[roomID.toString()];
    console.log('Model > removeSession > session efter ', session);
};

exports.numberOfPLayersInGame = (roomID) => {
    return session[roomID].gameData.length;
};

// ===================================== LOBBY EMITS =====================================

exports.emitOnRoomUpdate = () => {
    console.log('emitOnRoomUpdate körs nu');
    exports.io.in('lobby').emit('reloadRoomList');
};

exports.emitPlayerJoinedRoom = (roomID, username) => {
    console.log('emitPlayerJoinedRoom körs nu');
    exports.io.in('lobby').emit('playerJoinedRoom', {roomID: roomID});
    exports.io.in(roomID.toString()).emit('playerJoinedGameRoom', {username: username});
};


exports.emitPlayerLeftRoom = (roomID, username) => {
    console.log('emitPlayerLeftRoom körs nu');
    exports.io.in('lobby').emit('playerLeftRoom', {roomID: roomID});
    exports.io.in(roomID.toString()).emit('playerLeftGameRoom', {username: username});
};


exports.emitPlayerIsReady = (roomID, username) => {
    console.log('emitPlayerIsReady');
    exports.io.in(roomID.toString()).emit('playerIsReady', {username: username});
};

exports.emitTimeOutDetected = (username, SessionOrRoom = null) => {
    console.log('outer emitTimeOutDetected username: ', username);
    if(SessionOrRoom === 'session') {
        console.log('inner emitTimeOutDetectedSession');
        users[username].socket.emit('timeOutDetectedSession', {username: username});
    } else if(SessionOrRoom === 'room') {
        console.log('intner emitTimeOutDetectedRoom room');
        users[username].socket.emit('timeOutDetectedRoom', {username: username});
    } else {
        console.log('inner emitTimeOutDetectedNormal');
        users[username].socket.emit('timeOutDetected', {username: username});
    }
}

// ===================================== GAMEROOM EMITS =====================================

exports.emitStartGame = (roomID) => {
    exports.io.in(roomID.toString()).emit('startGame');
}; 


exports.emitStartRound = (roomID, nextRoundData) => {
    console.log('emitStartRound körs');
    console.log('emitStartRound roomID:',roomID);
    console.log('emitStartRound nextRoundData:',nextRoundData);
    exports.io.in(roomID.toString()).emit('startRound', nextRoundData);
};

exports.emitPlayCard = (roomID, cardPlayed, username) => {
    exports.io.in(roomID.toString()).emit('cardPlayed', {cardPlayed, playedByUser:username});
}

exports.emitGameOver = (roomID, playersInGame) => {
    console.log('emitGameOver players in game: ', playersInGame);
    exports.io.in(roomID.toString()).emit('gameOver', {playersInGame:playersInGame});
};

exports.emitGameRoomDestroyed = (roomID, playersInGame) => {
    exports.io.in(roomID.toString()).emit('gameRoomDestoryed', {playersInGame:playersInGame});
}




exports.handleTimeOut = (username) => {
    const user = users[username];
    if(!user.timedOut) {
        this.clearTimeOut(user);
        this.setTimeOut(user);
    }
};

exports.clearTimeOut = (user) => {
    if(user.timeOutReference !== null) {
        clearTimeout(user.timeOutReference);
    }
};

exports.setTimeOut = (user) => {
    user.timeOutReference = setTimeout(() => {
        
        if(user.currentRoom !== null) {
            if(this.userInSession(user.username)) {
                console.log('setTimeOut if session kör ', user.username);
                this.emitTimeOutDetected(user.username, 'session');
            } else {
                console.log('setTimeOut if room kör ', user.username);
                this.emitTimeOutDetected(user.username, 'room');
            }
        } else {
            console.log('setTimeOut if container kör ', user.username);
            this.emitTimeOutDetected(user.username);
        }
        user.timedOut = true;
        console.log('user.timedOut= ', user.timedOut);
    }, 60000*2);
};