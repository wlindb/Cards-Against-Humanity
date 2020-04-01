// import  Assistant from './Assistant.js';

const { Sequelize, DataTypes, Model } = require('sequelize');

// const sequelize = new Sequelize('sqlite::memory');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './Database/db.sqlite',
});
const crypto = require('crypto');


/**
 * <--------------------------------MODEL INITILIZTION--------------------------------------------->
 */

// Import all tables with their associated functions 
const users = require('./Users');
const rooms = require('./Rooms');
const sessions = require('./Sessions');
const answerCards = require('./Answer_cards');
const questionCards = require('./Question_cards');

// Call init function 
const dbUser = users(sequelize,Model,DataTypes);
const dbRooms = rooms(sequelize,Model,DataTypes);
const dbSessions = sessions(sequelize,Model,DataTypes);
const dbAnswerCards = answerCards(sequelize,Model,DataTypes);
const dbQuestionCards = questionCards(sequelize,Model,DataTypes);

// Define exports 
module.exports = {
  users : dbUser,
  rooms : dbRooms,
  sessions : dbSessions,
  answerCards : dbAnswerCards,
  questionCards : dbQuestionCards,
};


