/**
 * Sessions
 * Connects users and rooms, models an active game session
 *         //   CREATE TABLE Sessions(
        //     username TEXT PRIMARY KEY,
        //     room_id TEXT NOT NULL,
        //     score NUMBER,
        //     czar TEXT,
        //     cards_in_use TEXT,
        //     FOREIGN KEY(room_id) REFERENCES Rooms(room_id) 
        //   );
 */

module.exports = function (sequelize, Model, DataTypes){

    class Sessions extends Model {}
    sequelize.sync({force: false});
    let sessionModel = Sessions.init({
          room_id: {
            type: DataTypes.STRING,
            primaryKey: true,
        
          },
          czar: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          gameData: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          roundsPlayed: {
            type: DataTypes.NUMBER,
            allowNull: false,
          },
          blackCard: {
            type: DataTypes.TEXT,
          },
        }, {
          // Other model options go here
          sequelize, // We need to pass the connection instance
          modelName: 'Sessions', // We need to choose the model name
          // I don't want createdAt
          createdAt: false,
          updatedAt: false,
          id: false,
        });

    // sessionModel.WHATEVER FUNCTION =

    sessionModel.initHand = async function initHand(roomID, gameData){
      await Sessions.update({gameData:JSON.stringify(gameData)}, {
        where:{
          room_id: roomID,
        }
    }).catch((error) =>{
      console.log('update error');
      console.log(error);
    });
    }

    sessionModel.updateSession = async function updateSession(roomID, czar, gameData, roundsPlayed, blackCard) {
      await Sessions.update({czar:czar, gameData:JSON.stringify(gameData), roundsPlayed,roundsPlayed, blackCard:JSON.stringify(blackCard)}, {
        where:{
          room_id: roomID,
        }
        }).catch((error) =>{
          console.log('update error');
          console.log(error);
        });
    }

    sessionModel.addSession = async function addSession(room_id, czar, gameData, roundsPlayed, blackCard){
      // const tmp = score;
      await sequelize.sync({ force: false });
      
      const session = await Sessions.findAll({
        where: {
          room_id:room_id
        }
      }).catch((error) =>{
        console.log('find error');
        console.log(error);
      });
      if(session.length>0){
        await Sessions.update({czar:czar, gameData:JSON.stringify(gameData), roundsPlayed,roundsPlayed, blackCard:JSON.stringify(blackCard)}, {
          where:{
            room_id: room_id,
          }
      }).catch((error) =>{
        console.log('update error');
        console.log(error);
      });
      }else {
      await Sessions.create({
          room_id,
          czar,  
          gameData:JSON.stringify(gameData),
          roundsPlayed,
          blackCard:JSON.stringify(blackCard),
        }).catch((error) =>{
          console.log('create error');
          console.log(error);
        });
      }
      // return session;
    }

    sessionModel.getSessions = async function getSessions() {
      let sessions = await Sessions.findAll({
      });
      console.log('getSessions from db ', sessions);
      sessions = sessions.map((session) => {
        session.gameData = JSON.parse(session.gameData);
        console.log('inne i map session.gameData ', session.gameData);
        session.blackCard = JSON.parse(session.blackCard);
        return session
      });
      console.log('getSessions from db2 ', sessions);
      return sessions;
    }

    sessionModel.destroySession = async function destroySession(roomID) {
      await Sessions.destroy({
        where: {
          room_id: roomID,
        } 
      });
    }

    return sessionModel;
}
