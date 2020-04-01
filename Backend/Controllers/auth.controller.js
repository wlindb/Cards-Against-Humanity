'use strict';
const express = require('express');
const model = require('../model');
const db = require('../Database/database');

var router = express.Router();

const requireAuth = (req, res, next) => {
  const maybeUser = model.findUser(req.session.userID);
  const remoteCall = req.session.ip !== req.connection.remoteAddress;
  // "auth" check
  if (maybeUser === undefined || remoteCall) {
    res.sendStatus(401);
    return;
  }

  next();
};


router.get('/isAuthenticated', (req, res) => {
    console.log('req.session.userID i isauth \n', req.session.userID);
    const maybeUser = model.findUser(req.session.userID);
    // console.log('maybe user', maybeUser);
    // res.set('Access-Control-Allow-Origin', '*');
    res.status(200).json({
        isAuthenticated: maybeUser !== undefined,
        // username: maybeUser !== undefined ? maybeUser : null,
    });
});


/**
 * Endpoint for authenticating a user
 * username and password is passed in the body and is validated against the database.
 * User object representing the user is created 
 */
router.post('/authenticate', (req, res) => {
  // Todo: implement login validation
  // db.users.createUser('wlindb','willeking','william');
  // db.users.getUsers();
  db.users.validateUser(req.body.username,req.body.password)
  .then((valid)=>{
    console.log('valid:', valid);
    if (valid) {
      // Update the userID of the currently active session
      console.log('???????????????????????????????????????????????????????????????????????????????????????????????????');
      console.log('session:\n', req.body.username);
      console.log('req.connection.remoteAddress ', req.connection.remoteAddress);
      console.log('req.ip ', req.ip);
      console.log(req.session.cookie);
      console.log('???????????????????????????????????????????????????????????????????????????????????????????????????');
      console.log('========================================');
      req.session.userID = req.body.username;
      req.session.ip = req.connection.remoteAddress;
      res.set('user', req.body.username);
      model.addUser(req.body.username, req.session.socketID);
      // Join lobby channel
      const user = model.findUser(req.body.username);
      // console.log('user.socket ', user.socket);
      if(user.socket === null){
        console.log('INNE I EDGE CASE SOCKETS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! socketID', req.session.socketID);
        res.status(200).json({
          reloadSocket: true,
        });
        return;
      }
      user.socket.join('lobby');

      req.session.save((err) => {
        if (err) console.error(err);
        else console.debug(`Saved userID: ${req.session.userID}`);
      });
      const inSession = model.userInSession(req.body.username);
      res.status(200).json({
        inSession: inSession,
      });
    } else {
      res.sendStatus(401);
    }
  });
});

router.post('/logout', (req, res) => {
  console.log('/logut req.body.username', req.body.username);
  // Leave lobby channel
  const user = model.findUser(req.body.username);
  if(user !== undefined) {
    model.clearTimeOut(user); 
    user.socket.leave('lobby');
    // Implement
    model.removeUser(req.body.username);
    req.session.userID = undefined;
    req.session.roomID = undefined;
    req.session.save((err) => {
      if (err) console.error(err);
      else console.debug(`Logout: Saved userID: ${req.session.userID}`);
    });
    
    res.status(200).json({
      isAuthenticated: false,
    });
  } else {
    res.sendStatus(403);
  }
});

router.post('/register', (req, res) => {
  db.users.getUser(req.body.username)
  .then((user) => {
    if(user !== undefined) res.sendStatus(406);
    else return user;
  })
  .then((user) => {
    db.users.createUser(req.body.username, req.body.password, req.body.name)
    .then(dbRes => {
      res.sendStatus(200);
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    })
  });
});

 module.exports= { router, requireAuth }; 