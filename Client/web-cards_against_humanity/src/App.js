import React from 'react';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import GameLobby from './components/GameLobby/GameLobby';
import { HashRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import './App.css';
import io from 'socket.io-client';
import Container from './components/Container/Container';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

class App extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      isAuthenticated: false,
      socket: io().connect(),
      roomID: '',
    };
    this.setIsAuthenticated = this.setIsAuthenticated.bind(this);
    // this.updateRoomID = this.updateRoomID.bind(this);
    this.state.socket.on('timeOutDetected', (data) => {
      console.log('\n\ntimeOutDetected\n\n'); 
      this.onTimeOutDetected(data.username);
    });

    // this.state.socket.on('disconnect', () => {
    //   console.log('nu kör vi disconnect');
    //   this.onTimeOutDetected();
    // });
  }

  componentDidMount() {
    fetch('/isAuthenticated', {
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
        isAuthenticated: res.isAuthenticated,
      });
    })
    .catch((err) => {
      console.log(err);
    })
  }

  onTimeOutDetected = (username) => {
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
        // Login successful: 
        // Notify parent (App.js) to be able to access Protected Routes
        this.setState({isAuthenticated: false});
        // Redirect to lobby
        // this.props.history.push('/');
    })
    .catch(err => {
        // TODO: Handle login denied.
        // Show <p> or something
        console.log(err);
    });
  }

  setIsAuthenticated () {
    this.setState({isAuthenticated: !this.state.isAuthenticated});
    console.log('parent ',this.state.isAuthenticated);
  }

  // updateRoomID = (id) => {
  //   this.setState({
  //     roomID: id,
  //   });
  // };

  render() {
    return (
      <div className="App">
        <Router>
          <Switch>
            <ProtectedRoute exact path='/gameLobby' setIsAuthenticated={this.setIsAuthenticated} socket={this.state.socket} isAuthenticated={this.state.isAuthenticated} component={GameLobby} />
            <ProtectedRoute exact path='/lobby' setIsAuthenticated={this.setIsAuthenticated} socket={this.state.socket} isAuthenticated={this.state.isAuthenticated} component={Container}/>
            <Route exact path='/register' component={Register}/>
            <Route exact path='/' component={({...props}) => <Login {...props} socket={this.state.socket} isAuthenticated={this.state.isAuthenticated} setIsAuthenticated={this.setIsAuthenticated}/>}/>
            <Route path='*' component={() => '404 NOT FOUND'}/>
          </Switch>
        </Router>
        {/* { !isAuthenticated && <Login/> } */}
        {/* { isAuthenticated && <Container/> } */}
      </div>
    );
  }
}

export default App;
