import React from 'react';
import './RoomItem.css';

export default class RoomItem extends React.Component  {
    constructor(props) {
        super(props);
        this.state = {
            playersInRoom: 0,
            maxPlayers: 4,
        };
    }

    // componentDidUpdate() {
    //     console.log('componentDidUpdate i RoomItem');
    //     this.setState({
    //         playersInRoom: this.props.playersInRoom,
    //     });
    // }

    render(){
        return(
            <div className="room-item-container">
                <div className="room-info-container">
                    <h3>{this.props.roomName}</h3>
                    <h3>{this.props.playersInRoom}/{this.state.maxPlayers}</h3>
                </div>
                <div className="btn-container">
                    <button disabled={this.props.playersInRoom >= this.state.maxPlayers} onClick={this.props.onJoinRoomClicked} className="join-room-btn">Join</button>
                </div>
            </div>
        );
    }
};
