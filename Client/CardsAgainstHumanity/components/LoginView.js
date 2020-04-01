import React, { Component } from 'react';
import { Text, View } from 'react-native';

export default class LoginView extends Component {
    constructor(props){
        super(props);
        this.state= {text: 'HEJ HEJ'};
    }

    componentDidMount(){
        fetch('http://130.229.129.124:8989/')
        .then((res) => { 
            return res.json();
        })
        .then(response => {
            // console.log('response:\n', response);
            this.setState({text: response.text})
        });
    }

    render() {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text>{this.state.text}</Text>
        </View>
    );
    }
}