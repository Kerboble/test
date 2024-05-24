import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from './authContext';
import { io } from 'socket.io-client';

const SocketContext = createContext();

const SocketContextProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        // Reuse existing socket connection if currentUser remains the same
        if (!socket && currentUser) {
            const newSocket = io('http://localhost:3000');
            setSocket(newSocket);
        }

        // Cleanup function to disconnect socket when currentUser changes or component unmounts
        return () => {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        };
    }, [currentUser, socket]);

    useEffect(() => {
        if (socket) {
            // Emit 'registration' event with user's ID upon connection
            socket.on('connect', () => {
                socket.emit('registration', currentUser._id);
            });

            // Listen for 'message' event from server
            socket.on('message', (data) => {
                console.log('Received message:', data);
                // Update state or perform other actions based on received data
            });

            // Error handling for socket connection
            socket.on('error', (error) => {
                console.error('Socket connection error:', error);
            });
        }
    }, [socket, currentUser]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export { SocketContext, SocketContextProvider };
