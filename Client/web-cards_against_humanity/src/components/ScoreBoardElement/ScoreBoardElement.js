import React from 'react';
import './ScoreBoardElement.css';
import default_image from './default-user.png';

const ScoreBoardElement = (props) =>  {
    return(
        <div className="scoreboard-item-container">
            <div className="image-wrapper">
                <img src={props.image ? props.image : default_image}/>
            </div>
            <div className="info-wrapper">
                <h2 className="player-name-header">{props.username}</h2>
                {
                    props.gameHasStarted && <p className="player-score">POINTS: {props.score}</p>
                }
                {
                    props.winner &&  <i id="winner-icon" className="fa fa-trophy"/>
                }
                {   
                    !props.gameHasStarted ? (props.isReady ? <i id="ready-status-icon" hidden={props.gameHasStarted} className="fa fa-check"></i> : <i id="ready-status-icon" hidden={props.gameHasStarted} className="fa fa-spinner fa-spin"></i>): undefined
                    
                }
            </div>
        </div>
    );
}

export default ScoreBoardElement;