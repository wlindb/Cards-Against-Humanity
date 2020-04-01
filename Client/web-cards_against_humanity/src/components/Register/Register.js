import React from 'react';
import './Register.css';
// import '../../../node_modules/font-awesome/css/font-awesome.min.css'; 
const LOGIN_PATH = '/';

export default class register extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            name:'',
            password: '',
            reEnterPassword: '',
        };
        this.onUsernameChange = this.onUsernameChange.bind(this);
        this.onPasswordChange = this.onPasswordChange.bind(this);
        this.onNameChange = this.onNameChange.bind(this);
        this.onReEnterPasswordChange = this.onReEnterPasswordChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentWillMount() {
        if(this.props.isAuthenticated) {
            // Already logged in. Redirect to lobby
            this.props.history.push(LOGIN_PATH);
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
    onNameChange(e) {
        e.preventDefault();
        this.setState({name: e.target.value});
    }
    onReEnterPasswordChange(e) {
        e.preventDefault();
        this.setState({reEnterPassword: e.target.value});
    }

    onSubmit(e) {
       e.preventDefault();
       fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: this.state.username,
                name: this.state.name,
                password: this.state.password,
            })
        })
        .then((res) => {
            if(res.ok) return res;
            else {
                throw new Error("Registrering misslyckades");
            }
        })
        .then((res) => {
            // Registration successful: 
            // Redirect to login page
            this.props.history.push(LOGIN_PATH);
        })
        .catch(err => {
            // TODO: Handle login denied.
            // Show <p> or something
            console.log(err);
        });
    }
    render() {
        let passwordMatches = this.state.reEnterPassword.length > 0 && this.state.password === this.state.reEnterPassword;
        return (
            <div className="register-view-wrapper" >
                {/* <h2 style={font}>Welcome to the Cards Against Humanity Clone!</h2> */}
                <div className="register-container">
                    <div className="register-box">
                        <h2>Register</h2>
                        <form id="form" onSubmit={this.onSubmit}>
                            <div className="form-group">
                                {/* <i class="fas fa-user"></i> */}
                                <i className="fa fa-user"/>
                                <input type="text" required placeholder="Username" className="form-control" value={this.state.username} onChange={this.onUsernameChange} />
                            </div>
                            <div className="form-group">
                                {/* <i class="fas fa-user"></i> */}
                                <i className="fa fa-user"/>
                                <input type="text" required placeholder="Name" className="form-control" value={this.state.name} onChange={this.onNameChange} />
                            </div>
                            <div className="form-group">
                            {/* <i class="fas fa-lock"></i> */}
                                <i className="fa fa-lock"/>
                                <input type="password" required placeholder="Password" className="form-control" value={this.state.password} onChange={this.onPasswordChange} />
                            </div>
                            <div className="form-group">
                            {/* <i class="fas fa-lock"></i> */}
                                
                                <i className="fa fa-lock"/>
                                <input type="password" required placeholder="Re-enter Password" className="form-control" value={this.state.reEnterPassword} onChange={this.onReEnterPasswordChange} />
                                { passwordMatches &&
                                <i id="password-match" className="fa fa-check"></i>
                                }
                                { this.state.reEnterPassword.length > 0 && this.state.password !== this.state.reEnterPassword &&
                                <i id="password-no-match" className="fa fa-times"></i>
                                }
                            </div>
                            <button type="submit" disabled={!passwordMatches} className="register-btn">Register user</button>
                            <p>{this.state.value}</p>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}