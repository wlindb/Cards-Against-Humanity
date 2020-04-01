/**
 * Answer_cards
 * represents a white card
//   CREATE TABLE Answer_cards(
//     id TEXT PRIMARY KEY,
//     answer TEXT
//   );
 */


module.exports = function (sequelize, Model, DataTypes){

    class Answer_cards extends Model {}
    sequelize.sync({force: false});
    let answerModel = Answer_cards.init({

          id: {
            type: DataTypes.STRING,
            primaryKey: true,
        
          },
          answer: {
            type: DataTypes.STRING,
            allowNull: false,
          }
        }, {
          // Other model options go here
          sequelize, // We need to pass the connection instance
          modelName: 'Answer_cards', // We need to choose the model name
          // I don't want createdAt
          createdAt: false,
          updatedAt: false,
          id: false,
        });

    // answerModel.WHATEVER FUNCTION =

    answerModel.addAnswerCard = async function addAnswerCard(id,answer){
      await sequelize.sync({ force: false });
        const card = await Answer_cards.create({
          id,
          answer,
        });
    }

    answerModel.getWhiteCards = async function getWhiteCards(){
      const card = await Answer_cards.findAll({
      });
      return card;
    }

    return answerModel;
}


