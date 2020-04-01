/**
 * Users
 * Table holding data related to our users
 */
module.exports = function (sequelize, Model, DataTypes){
    /**
     * Rooms
     * Hold data releted to an active game room.
     */
    class Rooms extends Model {}
    sequelize.sync({force: false});
    let roomModel =  Rooms.init({
        //   CREATE TABLE Rooms(
        //     room_id TEXT PRIMARY KEY,
        //     room_name TEXT NOT NULL,
        //     host TEXT NOT NULL
        //   );
        room_id: {
            type: DataTypes.STRING,
            primaryKey: true,

        },
        room_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        host: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        czar: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        w_cards_in_use: { // foreign key ref Rooms -> room_id
            type: DataTypes.STRING,
        },
        b_cards_in_use: { // foreign key ref Rooms -> room_id
            type: DataTypes.STRING,
        },
    }, {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'Rooms', // We need to choose the model name
    // I don't want createdAt
    createdAt: false,
    updatedAt: false,
    id: false,
    });

    roomModel.createRoom = async function createRoom(room_id, room_name, host){
        await sequelize.sync({ force: false });
        const room = await Rooms.create({
            room_id,
            room_name,
            host,
        });
        return room;
    }

    roomModel.getRooms = async function getRooms() {
        const rooms = await Rooms.findAll({
        });
        return rooms;
    }

    roomModel.destroyRoom = async function destroyRoom(roomID) {
        await Rooms.destroy({
            where: {
                room_id: roomID
            }
        });
    }
    
    return roomModel;
}


