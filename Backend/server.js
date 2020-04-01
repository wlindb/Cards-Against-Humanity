/* eslint-disable no-param-reassign */

'use strict';


// Def: Better debugging 
const betterLogging = require('better-logging');
// enhances log messages with timestamps etc
betterLogging.default(console, {
  stampColor: (Color) => Color.Light_Green,
  typeColors: (Color) => ({
    log: Color.Light_Green,
  }),
});
console.loglevel = 4; // Enables debug output
// End def

// #region require dependencies
const express = require('express');
const expressSession = require('express-session');
const socketIOSession = require('express-socket.io-session');
const http = require('http');
const db = require('./Database/database');
const path = require('path');
const model = require('./model');
const https = require('https');
const fs = require('fs');
const httpsOptions = {
  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'server.crt')),
  key: fs.readFileSync(path.join(__dirname, 'ssl', 'server.key'))
};
// #endregion


// #region setup boilerplate
const publicPath = path.join(__dirname, '..', 'Client', 'web-cards_against_humanity', 'build');
const port = 8989; // The port that the server will listen to
const app = express(); // Creates express app

// Express usually does this for us, but socket.io needs the httpServer directly
const httpServer = https.Server(httpsOptions, app);
const io = require('socket.io').listen(httpServer, {cookie: false}); // Creates socket.io app

// Setup session
const session = expressSession({
  secret: 'Super secret! Shh! Don\'t tell anyone...',
  resave: true,
  saveUninitialized: true,
  
  cookie:{
    // expires: new Date(Date.now() + 20000),
    // maxAge: 20000,
    secure: true,
  }
});
// #endregion

app.use(express.urlencoded({ extended: true }));

/**
 * Middleware setup:
 */
app.use(session);
io.use(socketIOSession(session, {
  autoSave: true,
  saveUninitialized: true,
}));

app.use(betterLogging.expressMiddleware(console, {
  ip: { show: true },
  path: { show: true },
  body: { show: true },
}));

const helmet = require('helmet');
const cors = require('cors');
const corsOptions = {
  origin: true,
  credentials: true,
};
app.options('*', cors(corsOptions));

app.use(helmet.contentSecurityPolicy({
  directives: {
    connectSrc: [ "'self'", "ws://localhost:8989", "wss://localhost:8989"],
    defaultSrc: ["'self'", 'https://fonts.googleapis.com','https://stackpath.bootstrapcdn.com','https://fonts.gstatic.com'],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", 'https://stackpath.bootstrapcdn.com', 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
    fontSrc: ["'self'", 'https://stackpath.bootstrapcdn.com', 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
    imgSrc: ["'self'"],
    reportUri: '/report-violation',
    objectSrc: ["'none'"],
    upgradeInsecureRequests: false,
    workerSrc: false  // This is not set.
  },

    // This module will detect common mistakes in your directives and throw errors
    // if it finds any. To disable this, enable "loose mode".
    loose: false,
  
    // Set to true if you only want browsers to report errors, not block them.
    // You may also set this to a function(req, res) in order to decide dynamically
    // whether to use reportOnly mode, e.g., to allow for a dynamic kill switch.
    reportOnly: false,
  
    // Set to true if you want to blindly set all headers: Content-Security-Policy,
    // X-WebKit-CSP, and X-Content-Security-Policy.
    setAllHeaders: false,
  
    // Set to true if you want to disable CSP on Android where it can be buggy.
    disableAndroid: false,
  
    // Set to false if you want to completely disable any user-agent sniffing.
    // This may make the headers less compatible but it will be much faster.
    // This defaults to `true`.
    browserSniff: true
}));


app.use(express.json()); /*
This is a middleware that parses the body of the request into a javascript object.
It's basically just replacing the body property like this:
req.body = JSON.parse(req.body)
*/


app.use('/', (req, res, next) => {
  const username = req.session.userID;
  const userInServerMemory = username ? model.findUser(username) : undefined; 
  if(username !== undefined && userInServerMemory !== undefined) {
    console.log('middleware / kör handleTimeOut på ', username);
    model.handleTimeOut(username);
  }
  next();
});

// Serve client
app.use(express.static(publicPath));


// Bind controllers to app
const auth = require('./Controllers/auth.controller');
const lobby = require('./Controllers/lobby.controller');
const game = require('./Controllers/game.controller');
app.use('/', auth.router);
app.use('/', auth.requireAuth, lobby.router);
app.use('/', auth.requireAuth, game.router);


model.init({ io });
model.initRoomList();
model.initSessions();
model.initCards();

model.printSessions();
// Handle connected socket.io sockets
io.on('connection', (socket) => {
  console.log('i conntect');
  // This function serves to bind socket.io connections to user models
  // console.log('socket ####################################\n\n\n\n\n\n\n\n\n\n', socket);
  // console.log('\n\n\n\n\n\n\n\n\n\n');
  
  if (socket.handshake.session.userID
    && model.findUser(socket.handshake.session.userID) !== undefined
    ) {
      console.log('connection if körs socket: ');
      // If the current user already logged in and then reloaded the page
      model.updateUserSocket(socket.handshake.session.userID, socket);
  } else {
    socket.handshake.session.socketID = model.addUnregisteredSocket(socket);
    socket._sockname = socket.handshake.session.socketID;
    socket.handshake.session.save((err) => {
      if (err) console.error(err);
      else console.debug(`Saved socketID: ${socket.handshake.session.socketID}`);
      // console.debug(`i connection ska denna soc`)
    });
  }

});
  



// Start server
httpServer.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});