import React, { Component, useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';

/**
 * Tar emot componenten man vill routra till samt isAuthenticated för att avgöra ifall man ska få anv'nda den eller inte.
 * isAuthenticated måste passas ned från dne övre komponenten.
 * @param {Component, isAuthenticated} param 
 */
const ProtectedRoute = ({component: Component, setIsAuthenticated, isAuthenticated, socket, ...rest}) => {
    return (
        <Route 
            {...rest}
            render = {props => {
                if(isAuthenticated === true) {
                    return <Component setIsAuthenticated={setIsAuthenticated} socket={socket} {...props}/>
                } else {
                    return (
                        <Redirect
                            to= {{
                                pathname: '/',
                                state: {
                                    from: props.location
                                }
                            }}
                        />
                    )
                }
            }}
        />
    );
};

export default ProtectedRoute;