import React from 'react';
import ScoreBoardElement from '../ScoreBoardElement/ScoreBoardElement.js';
import './GameLobby.css';
import GameBoard from '../GameBoard/GameBoard';
import { stat } from 'fs';

const LOBBY_PATH = '/lobby';

export default class GameLobby extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            playersInGame: [],
            gameHasStarted:false,
            roomID: '',
            host: '',
            currentRoom: {},
            playerOnScreen: '',
            winLimit: 2,
            showStartBtn: false,
            gameOver: false,
            rebootData: undefined,
        };
        this.updatePlayersInGame = this.updatePlayersInGame.bind(this);
        this.onReadyClicked = this.onReadyClicked.bind(this);
        this.updateUserIsReady = this.updateUserIsReady.bind(this);
        this.isGameReadyToStart = this.isGameReadyToStart.bind(this);
        this.onLeaveLobbyClicked = this.onLeaveLobbyClicked.bind(this);
        this.removePlayerFromGame = this.removePlayerFromGame.bind(this);
        this.updatePlayerScores = this.updatePlayerScores.bind(this);
        this.updateGameHasStarted = this.updateGameHasStarted.bind(this);

        this.props.socket.on('playerJoinedGameRoom', (data) => {
            console.log('nu körs jag :)  data = ', data);
            this.updatePlayersInGame(data.username);
        });

        this.props.socket.on('playerLeftGameRoom', (data) => {
            console.log('nu körs jag :)  data = ', data);
            this.removePlayerFromGame(data.username);
        });

        this.props.socket.on('playerIsReady', (data) => {
            // console.log('emit player is ready');
            this.updateUserIsReady(data.username);
            this.isGameReadyToStart();
        });

        this.props.socket.on('gameOver', (data) => {
            this.onGameOver(data.playersInGame);
        });

        this.props.socket.on('gameRoomDestoryed', (data) => {
            this.onGameRoomDestroyed(data.playersInGame);
        });

        this.props.socket.once('timeOutDetectedRoom', (data) => {
            console.log('timeOutDetectedRoom username = ', data.username);
            this.onTimeOutDetectedRoom(data.username);
        });

        this.props.socket.once('timeOutDetectedSession', (data) => {
            console.log('timeOutDetectedSession username = ', data.username);
            this.onTimeOutDetectedSession(data.username);
        })

    }

    onTimeOutDetectedSession = (username) => {
        fetch('/leaveGame', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(() => {
            setTimeout(() => {
                this.logoutOnTimeOut(username);
            }, 1000);
        })
        .catch((err) => {
            console.log(err);
        })
    }

    onTimeOutDetectedRoom = (username) => {
        fetch('/leaveGameLobby', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                roomID: this.state.roomID,
            })
        })
        .then(() => {
            this.logoutOnTimeOut(username);
        })
        .catch((err) => {
            console.log(err);
        })
    };

    logoutOnTimeOut = (username) => {
        fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
            })
        })
        .then((res) => {
            if(res.ok) return res;
            else {
                throw new Error("Logout failed");
            }
        })
        .then((res) => {
            // Notify parent (App.js) to be able to deny Protected Routes
            this.props.setIsAuthenticated();
            // Redirect to lobby
            this.props.history.push('/');
        })
        .catch(err => {
            // TODO: Handle login denied.
            // Show <p> or something
            console.log(err);
        });
    };

    onGameRoomDestroyed = (playersInGame) => {
        if(this.state.host === this.state.playerOnScreen){
            this.handleGameOver();
        }
    };

    onGameOver = (playersInGame) => {
        this.setState({
            gameOver: true,
            playersInGame,
        })
    }

    componentDidMount() {
        fetch('/gameLobbyData', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then((res) => {
            if(res.ok) return res.json();
            else {
                throw new Error("Data fetch failed");
            }
        })
        .then((res) => {
            if(res.sessionData === undefined){
                const { playersInGame, room, username } = res;
                console.log('body: ', res);
                // const room = res.body.room;
                // const playersInGame = res.body.playersInGame;
                this.setState({
                    playersInGame: playersInGame,
                    currentRoom: room,
                    roomID: room.roomID,
                    host: room.host,
                    playerOnScreen: username,
                });
                console.log('playerOnScreen', this.state.playerOnScreen);
            } else { // reboot step
                console.log('431243res from game lobby', res);
                const rebootdata = res;
                console.log('rebootdata från innne i if, ',rebootdata);
                const roomID = res.sessionData.roomID;
                const playersInGame = res.sessionData.gameData.map((user) => {
                    return {username:user.username, score:user.score};
                });
                console.log('playersInGame från gamelobby data reboot ', playersInGame);
                this.setState({
                    rebootData: rebootdata,
                    playersInGame: playersInGame,
                    gameHasStarted:true,
                    roomID: roomID,
                    host: res.host,
                    currentRoom: {},
                    playerOnScreen: res.username,
                    showStartBtn: false,
                    gameOver: false,    
                });
            }
            // console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
            // this.forceUpdate();
        })
        .catch(err => {
            // TODO: Handle login denied.
            // Show <p> or something
            // this.props.history.push('/lobby');
            console.log(err);
        });
        console.log('this.state.rebootdata, ', this.state.rebootData);
    }

    updateGameHasStarted = () => {
        this.setState({
            gameHasStarted:true,
        });
    }

    updatePlayerScores = (playerScores) => {
        console.log('update player scores parent körs', playerScores);
        const temp = playerScores.map((player) => {
            player.currentRoom = this.state.roomID;
            player.ready = true;
            if(player.score === this.state.winLimit){
                this.handleGameOver();
                this.setState({gameOver: true})
            }
            return player;
        });
        this.setState({
            playersInGame: temp,
        });
    }

    handleGameOver = () => {
        fetch('/handleGameOver', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                roomID: this.state.roomID,
                playersInGame: this.state.playersInGame,
            })
        })
        .catch((err) => {
            console.log(err);
        });
    }

    updateUserIsReady = (usr) => {
        console.log('updateuserIsReady körs');
        const tmp = this.state.playersInGame.map((user) => {
            if(user.username === usr){
                user.ready = !user.ready;
            }
            return user;
        });
        this.setState({
            playersInGame: tmp,
        });
    }

    isGameReadyToStart = () => {
        // Check if we can start game.
        if(this.state.playerOnScreen === this.state.host && this.state.playersInGame.length > 2){
            const tmp = this.state.playersInGame.filter((user) => {
                return user.ready;
            })
            if(tmp.length === this.state.playersInGame.length){
                //start game!
                this.setState({showStartBtn: true});
            } else {
                this.setState({showStartBtn: false});
            }
        }
    };

    updatePlayersInGame = (username) => {
        const alreadyInGame = this.state.playersInGame.filter(player => player.username === username).length > 0;
        if(!alreadyInGame){
            const player = {currentRoom: this.state.roomID, username: username, ready:false };
            this.setState({
                playersInGame: [...this.state.playersInGame, player].sort((player1, player2) => player1.username > player2.username),
            });
        }
    }

    onReadyClicked = (usr) => {
        console.log('on ready clicked parent');
        console.log('usr =', usr);

        const user = this.state.playersInGame.filter((user)=>{
            console.log('user.username ', user.username);
            return user.username === usr;
        })
        console.log('on ready clicked paret user = ', user);
        fetch('/playerIsReady', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user:user[0],
            })
        })
        .then((res) => {
            if(res.ok) return res;
            else {
                throw new Error("Data fetch failed");
            }
        })
        .catch(err => {
            // TODO: Handle login denied.
            // Show <p> or something
            console.log(err);
            window.location.reload();
        });
    }

    removePlayerFromGame = (username) => {
        const tmp = this.state.playersInGame.filter((user) => {
            return user.username !== username;
        });

        this.setState({
            playersInGame: tmp,
        });
    } 

    onLeaveLobbyClicked = () => {
        fetch('/leaveGameLobby', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                roomID: this.state.roomID,
            })
        })
        .then((res) => {
            if(res.ok) {
                this.props.history.push(LOBBY_PATH);
            } else {
                throw new Error('Leave lobby failed');
            }
        })
        .catch((err) => {
            console.log(err);
            window.location.reload();
        })
    }

    onBackToLobbyCliked = () => {
        fetch('/resetSessionRoomID', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then((res) => {
            if(res.ok) {
                this.props.history.push(LOBBY_PATH);
            } else {
                throw new Error('Back to lobby failed');
            }
        })
        .catch(err => {
            console.error(err);
            window.location.reload();
        });
        
    }

    startNewRound = (card) => {
        console.log('startNewRound körs', card);
        const winLimit = this.state.winLimit;
        const { playedByUser} = card;
        const score = this.state.playersInGame.filter((user) => {
            return user.username === playedByUser;
        })[0].score;
        console.log('startNewRound score', score);
        console.log('startNewRound winlimit', winLimit);
        if ((score+1) < winLimit) {
            fetch('/startNewRound', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            .catch(err => console.error(err));    
        } else {
            this.handleGameOver();
        }
    };  

    render() {
        console.log('currentRoom: ', this.state.currentRoom);
        console.log('playersinGame = ', this.state.playersInGame);
        console.log('this.state.playerOnScreen = ', this.state.playerOnScreen);
        return(
            <div className="game-room-container">
                {
                    !this.state.gameOver && 
                    <GameBoard
                        history={this.props.history} 
                        rebootData={this.state.rebootData}
                        username={this.state.playerOnScreen}
                        socket={this.props.socket}
                        winLimit={this.state.winLimit}
                        startNewRound={this.startNewRound}
                        updateGameHasStarted={this.updateGameHasStarted}
                        updatePlayerScores={this.updatePlayerScores}
                        onLeaveLobbyClicked={this.onLeaveLobbyClicked}
                        showStartBtn={this.state.showStartBtn}
                        onReadyClicked={() => this.onReadyClicked(this.state.playerOnScreen)}
                        />
                }
                {
                    this.state.gameOver && 
                    <div className="game-over-container">
                        <button onClick={this.onBackToLobbyCliked}>Back to lobby</button>
                    </div>
                }
                <ul className='scoreboard-ul'>
                    {/* TODO: MOVE STYLES OUT OF HERE AND CHANGE TO NOT HAVE A LIST MAYBE?? */}
                    {
                        this.state.playersInGame.map((player, i) => <li className='scoreboard-li'><ScoreBoardElement winner={player.score ===this.state.winLimit} score={player.score} playerScores={this.state.playerScores} username={player.username} isReady={player.ready} gameHasStarted={this.state.gameHasStarted}/></li>)
                    }
                </ul>
            </div>
        );
    }
}