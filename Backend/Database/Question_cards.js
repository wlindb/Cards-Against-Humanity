/**
 * Question_cards
 * represents a black card
 * 
//   CREATE TABLE Question_cards(
//     id TEXT PRIMARY KEY,
//     answer TEXT
//   );
 */


module.exports = function (sequelize, Model, DataTypes){

    class Question_cards extends Model {}
    sequelize.sync({force: false});
    let questionModel = Question_cards.init({

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
          modelName: 'Question_cards', // We need to choose the model name
          // I don't want createdAt
          createdAt: false,
          updatedAt: false,
          id: false,
        });

    // answerModel.WHATEVER FUNCTION =

    questionModel.addQuestionCard = async function addQuestionCard(id,answer){
      await sequelize.sync({ force: false });
        const card = await Question_cards.create({
          id,
          answer,
        });
    }

    questionModel.getBlackCards = async function getBlackCards(){
      const card = await Question_cards.findAll({
      });
      // console.log('\n\n\n\n\n\n\n\nblackCards from db= ', card);
      return card;
    }

    return questionModel;
}



