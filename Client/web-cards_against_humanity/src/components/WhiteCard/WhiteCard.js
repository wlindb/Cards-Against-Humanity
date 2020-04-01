import React from 'react';
import './WhiteCard.css';

export default class WhiteCard extends React.Component {
    constructor(props){
        super(props);
        this.state= {
            // selected: false,
        }
        this.onCardClicked = this.onCardClicked.bind(this);
    }


    onCardClicked = () => {
        // this.setState({selected: !this.state.selected});
        this.props.onCardClicked();
    }

    render() {
        return (
            <div className='white-card-view-wrapper' >
                {/* <h2 style={font}>Welcome to the Cards Against Humanity Clone!</h2> */}
                <div className={`white-card-container${this.props.selected ? '-selected' : ''}`} onClick={this.onCardClicked}>
                    <div className="white-card-box">
                        <h2>{this.props.card.text}</h2>
                    </div>
                </div>
            </div>
        )
    }
}

