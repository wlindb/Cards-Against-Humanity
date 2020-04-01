import React from 'react';
import './GameBoard.css';
import BlackCard from '../BlackCard/BlackCard';
import WhiteCard from '../WhiteCard/WhiteCard';

export default class GameBoard extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            updated: false,
            gameReadyToStart: false,
            gameHasStarted: false,
            hasPlayedThisRound: false,
            cardCzarsTurn: true,
            czar:'',
            blackCard: {},
            hand: [],
            cardsPlayedThisRound: [],
            selectedCard: '',
            rounds: 0,
        }
        this.onCardClicked = this.onCardClicked.bind(this);

        this.props.socket.on('startGame', () => {
            console.log('socket on startGame');
            this.startGame();
        });

        this.props.socket.on('startRound', (data) =>{
            console.log('data from startRound', data);
            this.initRoundData(data);
        });

        this.props.socket.on('cardPlayed', ({cardPlayed, playedByUser}) => {
            console.log('socket on card played', cardPlayed);
            console.log('socket on card played playedByUser', playedByUser);
            this.updateCardsPlayed(cardPlayed, playedByUser);
        });
    }

    componentDidUpdate() {
        console.log('reeeebot köööörs inte!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        console.log('this.props.', this.props.rebootData);
        console.log('this.props.', typeof(this.props.rebootData));
        if(this.props.rebootData !== undefined && !this.state.updated) {
            console.log('reeboooot körs!!!!!!!!!!!!!!!!!!!!!!!!!');
            const rebootData = this.props.rebootData;
            const czar = rebootData.sessionData.czar;
            const username = rebootData.username;
            const isCzar = czar === username;
            const blackCard = rebootData.sessionData.blackCard;
            console.log('blackcard: ', blackCard);
            console.log('typeof(blackvard', typeof(blackCard));
            console.log('gameData ', rebootData.sessionData.gameData);
            const hand = rebootData.sessionData.gameData.filter(user => user.username === username)[0].hand;
            console.log('hand, ' , hand);
            const rounds = rebootData.sessionData.roundsPlayed;
            this.setState({
                gameHasStarted: true,
                hasPlayedThisRound: false,
                cardCzarsTurn: isCzar,
                czar: czar,
                blackCard: blackCard,
                hand: hand,
                cardsPlayedThisRound: [],
                selectedCard: '',
                rounds: rounds,
                updated: true,
            });
        }
    }

    updateCardsPlayed = (cardPlayed, playedByUser) => {
        console.log('updateCardsPlayed');
        cardPlayed['playedByUser'] = playedByUser;
        console.log('cardPlayed från updateCardsplayed', cardPlayed);
        this.setState({cardsPlayedThisRound: [...this.state.cardsPlayedThisRound, cardPlayed]});
    };

    initRoundData = (data) => {
        this.setState({
            blackCard: data.blackCard,
            czar: data.czar,
            cardCzarsTurn: data.czar === this.props.username,
            hasPlayedThisRound: false,
            cardsPlayedThisRound: [],
            rounds: this.state.rounds + 1,
            // Fixa så att playersInGame scoren hamnar rätt
        });
        //proppa upp [{username:_, score:_}]
        console.log('data.playersingame',data.playersInGame);
        this.props.updatePlayerScores(data.playersInGame);
        if(this.state.hand.length < 10 && this.state.rounds > 1) {
            this.fetchNewCard();
        }
        console.log('czar', this.state.czar);
        console.log('czarturn', this.state.cardCzarsTurn);
    };

    fetchNewCard = () => {
        console.log('fetchNewCard');
        
        fetch('/getNewCard', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(res => {
            if(res.ok){
                return res;
            } else {
                window.location.reload();
            }
        })
        .then(res => res.json())
        .then((res) => {
            this.setState({
                hand: [...this.state.hand, res.card],
            });
        })
        .catch(err => {
            console.log(err);
        });
    };

    startGame = () => {
        console.log('startGame');
        this.setState({
            gameHasStarted: true,
        });
        fetch('/initHand', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(res => {
            if(res.ok) return res;
            else throw new Error('Start game failed');
        })
        .then(res => res.json())
        .then((res) => {
            this.setState({
                hand: res.cards,
            })
            //prop start boolean to gamelobby
            this.props.updateGameHasStarted();
        })
        .catch(err => {
            window.location.reload();
            console.log(err);
        });
    };

    onReadyClicked = () => {
        console.log('onRweadyClicked child');
        this.props.onReadyClicked();
    }

    onLeaveLobbyClicked = () => {
        console.log('onLeaveLobbyClicked child');
        this.props.onLeaveLobbyClicked();
    }

    onLeaveGameClicked = () => {
        fetch('/leaveGame', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then((res) => {
            if(res.ok){
                this.props.history.push('/lobby');
            } else {
                window.location.reload();
            }
        })
        .catch((err) => {
            console.log(err);
        })
    }

    onCardClicked = (id) => {
        console.log('onCardClicked')
        this.setState({selectedCard: id});
    }

    onPlayCardSelected = () => {
        if(this.state.hasPlayedThisRound) return;
        // let userAlreadyPlayed = this.state.cardsPlayedThisRound.filter(card => {
        //     return card.playedByUser === this.props.username;
        // });
        // console.log(userAlreadyPlayed);
        // userAlreadyPlayed = userAlreadyPlayed.length;
        // console.log(userAlreadyPlayed);
        // if(userAlreadyPlayed > 0){
        //     return;
        // }
        console.log('onPlayCardSelected');
        fetch('/playCard', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cardPlayed: this.state.hand.filter(card => card.id === this.state.selectedCard)[0],
            })
        })
        .then(res => {
            if(res.ok){
                return res;
            } else {
                window.location.reload();
            }
        })
        .then((res) => {
            this.setState({
                hand: this.state.hand.filter((card) => {
                    return card.id!== this.state.selectedCard;
                }),
                hasPlayedThisRound: true,
            });
        })
        .catch(err => {
            console.log(err);
        });
    }

    onCardChosenByCzar = () => {
        console.log('onCardChoseByCzar cardID =', this.state.selectedCard);
        const card = this.state.cardsPlayedThisRound.filter(card => card.id === this.state.selectedCard)[0];
        fetch('/chooseCard', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                card: card,
            })
        })
        .then((res) => {
            if(res.ok){
                this.props.startNewRound(card);
            } else {
                window.location.reload(); 
            }
        })
        .catch(err => {
            console.log(err);
        });

    }

    // startNewRound = (card) => {
    //     console.log('startNewRound körs', card);
    //     const winLimit = this.props.winLimit;
    //     const { playedByUser} = card;
    //     const score = this.state.playersInGame.filter((user) => {
    //         return user.username === playedByUser;
    //     })[0].score;
    //     console.log('startNewRound score', score);
    //     console.log('startNewRound winlimit', winLimit);
    //     if ((score+1) < winLimit) {
    //         fetch('/startNewRound', {
    //             method: 'GET',
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             },
    //         })
    //         .catch(err => console.error(err));    
    //     }
    // }; 

    onStartClicked = () => {
        console.log('onStartClicked kör /startGame');
        fetch('/startGame', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },

        })
        .then((res) => {
            if(res.status === 401) window.location.reload();
        })
        .catch(err => {
            console.log(err);
        });
    }

    render() {
        return(
            <div className='gameBoard-outer-container'>
                <div className='status-btn-container'>
                    {
                        this.props.showStartBtn && <button onClick={this.onStartClicked} className="start-btn" hidden={this.state.gameHasStarted}>Start Game</button>
                    }
                    <button className='ready-btn' hidden={this.state.gameHasStarted} onClick={this.onReadyClicked}>
                        Ready
                    </button>
                    <button className='leave-lobby-btn' hidden={this.state.gameHasStarted} onClick={this.onLeaveLobbyClicked}>
                        Leave Lobby
                    </button>
                    <button className='leave-game-btn' hidden={!this.state.gameHasStarted} onClick={this.onLeaveGameClicked}>
                        Leave Game
                    </button>
                </div>
                {
                    this.state.gameHasStarted && 
                    <div className='gameBoard-container'>
                        <div className="upper-gameboard-container">
                            <div clasName='black-card-container'>
                                <BlackCard card={this.state.blackCard} />
                            </div>
                            <div className='oppnents-card-container'>
                                <ul>
                                    {
                                        this.state.cardsPlayedThisRound.map((card) => {
                                            return <li><WhiteCard card={this.state.cardCzarsTurn ? card : {}} selected={card.id === this.state.selectedCard} onCardClicked={() => this.state.cardCzarsTurn ? this.onCardClicked(card.id) : undefined}/></li>
                                        })
                                    }        
                                </ul>
                            </div>
                        </div>
                        <div className='card-hand-container'>
                            <button hidden={this.state.cardCzarsTurn} onClick={this.onPlayCardSelected} disabled={this.state.selectedCard === ''} className='select-card-btn'>Play Card</button>
                            <button hidden={!this.state.cardCzarsTurn} onClick={this.onCardChosenByCzar} disabled={this.state.selectedCard === ''} className='select-card-btn'>Choose Card</button>
                            <ul>
                                {
                                    this.state.hand.map((card) => {
                                        return <li><WhiteCard selected={card.id === this.state.selectedCard} onCardClicked={() => !this.state.cardCzarsTurn ? this.onCardClicked(card.id) : undefined} card={card}/></li>
                                    })
                                }        
                            </ul>
                        </div>
                    </div>
                }
            </div>
        
        );
    }
}