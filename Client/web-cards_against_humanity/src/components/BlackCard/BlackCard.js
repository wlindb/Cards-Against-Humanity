import React from 'react';
import './BlackCard.css';

const BlackCard = (props) =>  {
    
    return (
        <div className="black-card-view-wrapper" >
            {/* <h2 style={font}>Welcome to the Cards Against Humanity Clone!</h2> */}
            <div className="black-card-container">
                <div className="black-card-box">
                    <h2>{props.card.text}</h2>
                </div>
            </div>
        </div>
    )
}

export default BlackCard;