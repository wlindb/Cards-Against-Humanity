'use strict';
const express = require('express');
const model = require('../model');
const db = require('../Database/database');

let router = express.Router();

router.post('/createRoom', (req, res) => {
    const roomName = req.body.roomName;
    const username = req.session.userID;
    const id = `${username}${Math.random().toString().substring(2,9)}`
    // id, roomName, username
    db.rooms.createRoom(id, roomName, username)
    .then((room) => {
        // update model
        console.log('inne i /createRoom, room = ', room);
        model.addRoom(id, roomName, username);
        // emit
        model.emitOnRoomUpdate();
        res.sendStatus(200);
    })
    .catch(err => {
        console.error(err);
        res.sendStatus(500);
    });
});

router.get('/fetchRoomList', (req, res) => {
    const roomList = Object.values(model.getRoomList());
    if(req.session.userID === undefined) {
        res.sendStatus(404);
    } else {
        const user = model.findUser(req.session.userID);
        console.log('roomList i fetchRooList ', roomList);
        console.log('/fetchRoomList req.session.userID = ',req.session.userID);
        console.log('/fetchRoomList user.currentRoom = ',user.currentRoom);
        res.status(200).json({
            roomList,
            currentRoom: user.currentRoom,
            username: req.session.userID,
        });
    }
});

router.post('/joinGameLobby', (req, res) => {
    const roomID = req.body.roomID;
    const username = req.session.userID;
    const user = model.findUser(username);
    if(user.currentRoom !== null) {
        res.sendStatus(401)
    } else {
        model.setCurrentRoom(username, roomID);
        user.socket.join(roomID.toString());
        model.incrementPlayersInRoom(roomID);
        model.emitPlayerJoinedRoom(roomID, username);
        req.session.roomID = roomID;
        req.session.save((err) => {
            if (err) console.error(err);
            else console.debug(`Saved roomID: ${req.session.roomID}`);
        });
        console.log('room list från /joinGameLobby ', model.getRoomList());
        res.sendStatus(200);
    }
});


router.post('/leaveGameLobby', (req, res) => {
    const roomID = req.body.roomID;
    const username = req.session.userID;
    console.log('/leaveGameLobby username: ',req.session.userID);
    const user = model.findUser(username);
    if(user.currentRoom === null) {
        res.sendStatus(401)
    } else {
        model.setCurrentRoom(username, null);
        user.socket.leave(roomID.toString());
        model.decrementPlayersInRoom(roomID);
        model.emitPlayerLeftRoom(roomID, username);
        model.setUserRoomStatus(username,false);
        req.session.roomID = null;
        req.session.save((err) => {
            if (err) console.error(err);
            else console.debug(`Saved roomID: ${req.session.roomID}`);
        });
        console.log('room list från /leaveGameLobby ', model.getRoomList());
        res.sendStatus(200);
    }
});

router.get('/gameLobbyData', (req, res) => {
    console.log('inne i gamelobby /gameLobbyData');
    const inSession = model.userInSession(req.session.userID);
    if(inSession) {
        console.log('============================================================================================');
        const roomID = model.findRoomIDByUsername(req.session.userID);
        console.log('============================================================================================');
        const username = req.session.userID;
        const user = model.findUser(username);
        model.setCurrentRoom(username, roomID);
        user.socket.join(roomID.toString());
        model.incrementPlayersInRoom(roomID);
        model.emitPlayerJoinedRoom(roomID, username);
        req.session.roomID = roomID;

        req.session.save((err) => {
            if (err) console.error(err);
            else console.debug(`Saved roomID: ${req.session.roomID}`);
        });
        const sessionData = model.findSession(roomID);
        const host = model.findRoom(roomID).host;
        res.status(200).json({
            sessionData: sessionData,
            host:host,
            username:req.session.userID,
        });
    } else {
        const roomID = req.session.roomID;
        const room = model.findRoom(roomID);
        const playersInGame = model.getPlayersInRoom(roomID);
        // console.log('players in game = ', playersInGame);
        // console.log('room = ', room);
        res.status(200).json({
            playersInGame,
            room,
            username: req.session.userID,
        });
    }
});



router.post('/playerIsReady', (req,res) => {
    console.log('POST playerisready');
    const user = req.body.user;
    const tmp = model.findUser(req.body.user.username);
    const maybeRoom = tmp ? tmp.currentRoom : null;
    console.log('req.body', req.body);
    console.log('user', user);
    if(maybeRoom !== null){
        model.toggleUserReady(user.username);
    
        model.emitPlayerIsReady(req.session.roomID, user.username);
        res.sendStatus(200);
    } else {
        res.sendStatus(401);
    }
});

module.exports={router}; 