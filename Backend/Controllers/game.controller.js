'use strict';
const express = require('express');
const model = require('../model');
const db = require('../Database/database');

let router = express.Router();

router.get('/startGame', (req, res) => {
    console.log('game controller /startGame');
    model.emitStartGame(req.session.roomID);
    
    const blackCard = model.getBlackCard();
    model.createSession(req.session.roomID, req.session.userID, blackCard);
    model.prepareNextRound(req.session.roomID);
    const session = model.findSession(req.session.roomID);
    const playersInGame = session.gameData;
    console.log('\n\n\n\n\n\nBLACKCARD ', blackCard);
    const nextRoundData = {blackCard: blackCard, czar:session.czar, playersInGame: playersInGame};

    model.emitStartRound(req.session.roomID, nextRoundData);

    res.sendStatus(200);
});

router.get('/initHand', (req, res) => {
    const cards = model.initHand(req.session.roomID, req.session.userID);
    res.status(200).json({
        cards,    
    });
});

router.post('/playCard', (req, res) => {
    model.removeCardFromHand(req.session.roomID, req.body.cardPlayed, req.session.userID);
    model.emitPlayCard(req.session.roomID, req.body.cardPlayed, req.session.userID);
    res.sendStatus(200);
});

router.post('/chooseCard', (req, res) => {
    console.log('req.body ', req.body);
    const { playedByUser } = req.body.card;
    console.log('playedByUser ', playedByUser);
    model.prepareNextRound(req.session.roomID);
    model.updatePlayerScore(playedByUser, req.session.roomID);
    res.sendStatus(200);
});

router.get('/startNewRound', (req, res) => {
    const session = model.findSession(req.session.roomID);
    const playersInGame = session.gameData;
    const blackCard = model.getBlackCard();
    const nextRoundData = {blackCard: blackCard, czar:session.czar, playersInGame: playersInGame};
    model.saveSessionToDB(req.session.roomID);
    console.log('startNewRound innan emit round, gamedata: ', nextRoundData);
    model.emitStartRound(req.session.roomID, nextRoundData);
    console.log('startNewRound efter emit round, gamedata: ', nextRoundData);
    res.sendStatus(200);
});

router.get('/getNewCard', (req, res) => {
    const card = model.addCardToHand(req.session.roomID, req.session.userID);
    model.saveSessionToDB(req.session.roomID);
    res.status(200).json({
        card,    
    });
});

router.post('/handleGameOver', (req, res) => {
    const roomID = req.body.roomID;
    const session = model.findSession(req.session.roomID);
    if(session === undefined) {
        res.sendStatus(404);
    } else {
        const playersInGameObject = session.gameData;
        const playersInGame = req.body.playersInGame.map(user => user.username);
        model.emitGameOver(roomID, playersInGameObject);
        console.log('/handleGameOver playerInGame', playersInGame);
        model.unsubscribePlayersFromGame(roomID, playersInGame);
        model.destroySession(roomID);
        model.destroyRoom(roomID);
        res.sendStatus(200);
    }
});

router.get('/resetSessionRoomID', (req, res) => {
    req.session.roomID = null;
    req.session.save((err) => {
        if (err) console.error(err);
        else console.debug(`Saved roomID: ${req.session.roomID}`);
    });
    res.sendStatus(200);
});



router.get('/leaveGame', (req, res) => {
    //Add check to se if there would be to few players in the room if someone leaves.
    const roomID = req.session.roomID;
    if(roomID !== undefined){
        const room = model.findRoom(roomID);
        const isHost = room.host === req.session.userID;
        console.log('/leaveGame host:', room.host);
        console.log('/leaveGame userID', req.session.userID);
        if(model.numberOfPLayersInGame(roomID) > 3 && !isHost){
            const username = req.session.userID;
            const user = model.findUser(username);
            model.removeUserFromSession(roomID, username);
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
            console.log('room list från /joinGameLobby ', model.getRoomList());
            res.sendStatus(200);
        } else {
            // destory game when less then 3 players in game
            const session = model.findSession(req.session.roomID);
            const playersInGameObject = session.gameData;
            model.emitGameRoomDestroyed(roomID, playersInGameObject);
            res.sendStatus(200);
        }   
    } else {
        res.sendStatus(403);
    }
});


// handleLeaveGame = (roomID) => {
//     model.emitGameRoomDestroyed(roomID);
// };

module.exports={router}; 

