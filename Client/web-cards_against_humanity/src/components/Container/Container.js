import React from 'react';
import './Container.css';
import RoomItem from '../RoomItem/RoomItem';
const GAMELOBBY_PATH = '/gameLobby';
export default class Container extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rooms: [],
            roomName: '',
            showCreateRoom: false,
            playersInRoom: {},
            username: '',
        };
        this.onCreateRoomClicked = this.onCreateRoomClicked.bind(this);
        this.onRoomNameChange = this.onRoomNameChange.bind(this);
        this.updateRoomList = this.updateRoomList.bind(this);
        this.onToggleCreateRoom = this.onToggleCreateRoom.bind(this);
        this.props.socket.on('reloadRoomList', () => {
            console.log('emit reloadRoomlist fungerade :)');
            this.updateRoomList();
        });
        this.props.socket.on('playerJoinedRoom', (data) => {
            console.log('nu körs jag :)  data = ', data);
            this.incrementPlayersInRoom(data.roomID);
        });

        this.props.socket.on('playerLeftRoom', (data) => {
            this.decrementPlayersInRoom(data.roomID);
        });

        
    }

    

    componentDidMount() {
        console.log('container did mount ');
        fetch('/fetchRoomList', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((res) => {
            return res.json();
          })
        .then((res) => {
            console.log('res',res);
            if(res.currentRoom !== null) {
                this.props.history.push(GAMELOBBY_PATH);
            } else {
                this.setState({
                    rooms: res.roomList,
                    username: res.username,
                });
            }
        })
          .catch((err) => {
            console.log(err);
        })
    }

    onCreateRoomClicked = (e) => {
        e.preventDefault();
        fetch('/createRoom', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                roomName: this.state.roomName,
            })
        })
        .then((res) => {
            if(res.status == 401){
                window.location.reload();
            } else if(res.ok) return res;
            else {
                throw new Error("Create room misslyckades");
            }
        })
        .then((res) => {
            // Todo close create game modal
        })
        .catch(err => {
            // TODO: Handle login denied.
            // Show <p> or something
            console.log(err);
        });
    }

    onRoomNameChange = (e) => {
        e.preventDefault();
        this.setState({
            roomName: e.target.value,
        });
    };

    updateRoomList = () => {
        fetch('/fetchRoomList', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((res) => {
            return res.json();
          })
        .then((res) => {
            console.log('res',res);
            this.setState({
              rooms: res.roomList,
            });
        })
          .catch((err) => {
            console.log(err);
        })
        this.setState({roomName: ''});
    }

    onToggleCreateRoom = () => {
        this.setState({showCreateRoom: !this.state.showCreateRoom});
        console.log('toggle');
    }; 
    
    onJoinRoomClicked = (roomID) => {
        console.log('onJoinRoomClicked i container');
        fetch('/joinGameLobby', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                roomID: roomID,
            })
        })
        .then((res) => {
            if(res.status === 401) {
                window.location.reload();
                // this.props.history.push('/');
            } else {
                this.props.history.push(GAMELOBBY_PATH);
            }
        })
          .catch((err) => {
            console.log(err);
        })
    };

    incrementPlayersInRoom = (roomID) => {
        let tempRooms = this.state.rooms;
        tempRooms.map(room => {
            if(room.roomID === roomID) room.playersInRoom++;
        });
        this.setState({
            rooms: tempRooms,
        });
    };
    decrementPlayersInRoom = (roomID) => {
        let tempRooms = this.state.rooms;
        tempRooms.map(room => {
            if(room.roomID === roomID) room.playersInRoom--;
        });
        this.setState({
            rooms: tempRooms,
        });
    };

    onLogoutClicked = (e) => {
        e.preventDefault();
        console.log('inne i onLogoutClicked');
        fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: this.state.username,
            })
        })
        .then((res) => {
            if(res.ok) return res;
            else {
                throw new Error("Logout failed");
            }
        })
        .then((res) => {
            // Login successful: 
            // Notify parent (App.js) to be able to access Protected Routes
            this.props.setIsAuthenticated();
            // Redirect to lobby
            this.props.history.push('/');
        })
        .catch(err => {
            // TODO: Handle login denied.
            // Show <p> or something
            console.log(err);
        });
    }
    render() {
        return (
            <div>
                <div className="create-room-wrapper">
                    <div className={`create-room-container${this.state.showCreateRoom ? '-shown' : '-hidden'}`}>
                        <form id="form" onSubmit={this.onCreateRoomClicked}>
                            <div className="form-group">
                                <a onClick={this.onToggleCreateRoom} ><i className="fa fa-user"/></a>
                                <input type="text" required placeholder="Room name" className="form-control" value={this.state.roomName} onChange={this.onRoomNameChange} />
                            </div>
                            {/* hidden={!this.state.showCreateRoom}
                            hidden={!this.state.showCreateRoom} */}
                            <button disabled={!this.state.showCreateRoom} type="submit" className="create-room-btn" >Create Room</button>
                            <button disabled={!this.state.showCreateRoom} className="log-out-btn" onClick={this.onLogoutClicked}>Log out</button>
                        </form>
                    </div>
                </div>
                <div className="roomlist-container">
                    {this.state.rooms.map((room, i) => <RoomItem playersInRoom={room.playersInRoom} onJoinRoomClicked={() => this.onJoinRoomClicked(room.roomID)} roomName={room.roomName}/>)}             
                </div>
            </div>
        );
    }
}