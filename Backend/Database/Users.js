const crypto = require('crypto');
/**
 * Users
 * Table holding data related to our users
 */
module.exports = function (sequelize, Model, DataTypes){
    class Users extends Model {}
    sequelize.sync({force: false});
    let userModel = Users.init({
        //   CREATE TABLE Users(
        //     username TEXT PRIMARY KEY,
        //     password TEXT NOT NULL,
        //     name TEXT NOT NULL,
        //     salt TEXT NOT NULL,
        //     profile_img BLOB 
        //   );
          username: {
            type: DataTypes.STRING,
            primaryKey: true,
        
          },
          password: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          name: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          salt: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          profile_img: {
            type: DataTypes.BLOB,
          },
        }, {
          // Other model options go here
          sequelize, // We need to pass the connection instance
          modelName: 'Users', // We need to choose the model name
          // I don't want createdAt
          createdAt: false,
          updatedAt: false,
          id: false,
        });


    /**
    * <----------------------------------User queries---------------------------------_>
    */
    userModel.getUsers = async function getUsers() {
            console.log('INNE I GET TIMESLOTS');
            // await sequelize.sync({ force: false });
            // const usr = await Users.create({
            //   username:  userModel2',
            //   password: 'pw2',
            //   name: 'terre',
            //   salt: 'salt',
            // });
            // console.log('user: ', usr);
            const users = await Users.findAll({
              // where: {
              //   username:  userModel'
              // },
            });
            console.log(users);
            console.log('INNE I GET TIMESLOTS ^^');
            return users;
    }
    /**
     * Lägger till en användare till databasen.
     */
    userModel.addUser = async function addUser(username,password,name,salt,img=null){
        await sequelize.sync({ force: false });
        const user = await Users.create({
          username,
          password,
          name,
          salt,
          profile_img: img,
        });
    }

    /**
     * Create a user and uses addUser to add it to the database
     */
    userModel.createUser = async function createUser(username, password, name, img=null){
        const salt = getSalt();
        const passwordData = generateHash(password, salt);

        await this.addUser(username, passwordData.hashedPassword, name, passwordData.salt, img);
    }

    /**
     * Returnerar en user baserat på username.
     */
    userModel.getUser = async function getUser(username){
        const user = await Users.findAll({
            where: {
              username:username
            }
        });
        return user[0];
    }

    /**
     * Returnerar alla anävndare fråndatabasen.
     */
    userModel.getUsers = async function getUsers(){
      const user = await Users.findAll({
      });
      return user;
    }

    /**
     * Updaterar en användares användarnamn, sequilize kommer fallera detta om anänvdarnamnet redan är taget.
     */
    userModel.updateUsername = async function updateUsername(oldUsername, newUsername){
      await Users.update({username: newUsername}, {
          where:{
            username: oldUsername,
          }
      }).catch((error) =>{
        console.log('Användarnamnet fanns redan');
        console.log(error);
      });
    }

    /**
     * Uppdaterar en användares lösenord
     */
    userModel.updatePassword = async function updatePassword(username, oldPassword, newPassword){

      const userData = await users.findall({
        attributes:['password','salt'],
        where:{
          username: username
        }
      }).catch((err)=>{
        console.log('user doesnt exist');
        console.log(err);
      })

      const hashOldPassword = generateHash(oldPassword,userData[1]);//hash old password with salt in db
      if(hashOldPassword === userData[0]){ //oldPassword was correct
        const hashedNewPassword = generateHash(newPassword,userData[1]);
        await users.update({password: hashedNewPassword}, {
          where:{
            username:username
          }
        }).catch((err)=>{
          console.log('password update failed unexpectedly');
          console.log(err);
        })
      }

    }


    /**
     * validate a login. use username to get stored hash and salt, then use same crypto functions to salt and hash pwd and compare the two
     */
    userModel.validateUser = async function validateUser(username, password){
        const user = await this.getUser(username);
        if(user === undefined){
            // didnt find user, invalid login
            return false;
        }
        const salt = user.salt;
        const hashedPwd = user.password;

        const { hashedPassword } = generateHash(password,salt);

        console.log('password in database: ', hashedPwd);
        console.log('given password hashed: ', hashedPassword);

        return hashedPwd === hashedPassword;
    }

    //Export usermodel
    return userModel;
}


/**
 * <---------------------------------Crypto functions---------------------------------->
 */

const getSalt = () => {
    const length = 16;
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  };
  
const generateHash = (password, salt) => {
    const hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    const value = hash.digest('hex');
    return { salt, hashedPassword: value };
};
  







