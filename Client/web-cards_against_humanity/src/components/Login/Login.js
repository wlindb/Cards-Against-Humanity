import React from 'react';
import bgImg from '../../img/loginBackground.jpeg';
import './Login.css';
// import '../../../node_modules/font-awesome/css/font-awesome.min.css'; 
const LOBBY_PATH = '/lobby';
const REGISTER_PATH = '/register';

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: ''
        };
        this.onUsernameChange = this.onUsernameChange.bind(this);
        this.onPasswordChange = this.onPasswordChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onRegisterClicked = this.onRegisterClicked.bind(this);
    }

    componentWillMount() {
        console.log('Component will mount login. isAuthenticated:',this.props.isAuthenticated);
        if(this.props.isAuthenticated) {
            // Already logged in. Redirect to lobby
            this.props.history.push(LOBBY_PATH);
        }
        // this.props.socket.on('test', () => {
        //     console.log('test emmit');
        //     alert("emit fungerade");
        // });
    }

    onUsernameChange(e) {
        e.preventDefault();
        this.setState({username: e.target.value});
    }

    onPasswordChange(e) {
        e.preventDefault();
        this.setState({password: e.target.value});
    }

    onSubmit(e) {
        e.preventDefault();
        console.log('inne i onSubmit');
        fetch('/authenticate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: this.state.username,
                password: this.state.password,
            })
        })
        .then((res) => {
            // console.log(res.json());
            if(res.ok) return res.json();
            else {
                throw new Error("Login misslyckades");
            }
        })
        .then((res) => {
            console.log('res autenticate:', res);
            // if(res.reloadSocket){

            //     console.log('halåååååååå');
            // }
            // Login successful: 
            // Notify parent (App.js) to be able to access Protected Routes
            this.props.setIsAuthenticated();
            // Redirect to lobby
            console.log('res från /auth', res);
            if(res.inSession) {
                this.props.history.push('/gameLobby');
            } else {
                this.props.history.push(LOBBY_PATH);
            }
        })
        .catch(err => {
            // TODO: Handle login denied.
            // Show <p> or something
            console.log(err);
        });
    }

    onRegisterClicked = (e) => {
        e.preventDefault();
        this.props.history.push(REGISTER_PATH);
    }

    render() {
        const styles = {
            backgroundImage:`url(${bgImg})`,
            height:"100%",
        }
        const font = {
            color: "#D3D3D3",  
            textShadow: "1px 0 0 #000, 0 -1px 0 #000, 0 1px 0 #000, -1px 0 0 #000",
            fontSize: "60px"
        }
        return (
            <div className="login-view-wrapper" >
                {/* <h2 style={font}>Welcome to the Cards Against Humanity Clone!</h2> */}
                <div className="login-container">
                    <div className="login-box">
                        <h2>Login</h2>
                        <form id="form" onSubmit={this.onSubmit}>
                            <div className="form-group">
                                {/* <i class="fas fa-user"></i> */}
                                <i className="fa fa-user"/>
                                <input type="text" placeholder="Username" className="form-control" value={this.state.username} onChange={this.onUsernameChange} />
                            </div>
                            <div className="form-group">
                            {/* <i class="fas fa-lock"></i> */}
                                <i className="fa fa-lock"/>
                                <input type="password" placeholder="Password" className="form-control" value={this.state.password} onChange={this.onPasswordChange} />
                            </div>
                            <button type="submit" className="login-btn">Login</button>
                            <button className="register-btn" onClick={this.onRegisterClicked}>Register</button> 
                            <p>{this.state.value}</p>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}