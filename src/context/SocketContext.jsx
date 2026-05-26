import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children, userId }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (userId) {
            // Extract the base URL without the /api/ path if present
            const backendBase = import.meta.env.VITE_BACKEND_URL;
            const backendUrl = backendBase ? backendBase.replace(/\/api\/?$/, "") : window.location.origin;
            
            const newSocket = io(backendUrl, {
                withCredentials: true
            });

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
                newSocket.emit('join', userId);
                setSocket(newSocket);
            });

            newSocket.on('receiveMessage', (message) => {
                window.dispatchEvent(new CustomEvent('doez:receive-message', { detail: message }));
            });

            // Real-time provider availability updates
            newSocket.on('providerAvailabilityChanged', (data) => {
                window.dispatchEvent(new CustomEvent('doez:provider-availability', { detail: data }));
            });

            newSocket.on('accountSuspended', (data) => {
                window.dispatchEvent(new CustomEvent('doez:account-suspended', { detail: data }));
            });

            return () => {
                newSocket.off('receiveMessage');
                newSocket.off('providerAvailabilityChanged');
                newSocket.off('accountSuspended');
                newSocket.close();
                setSocket(null);
            };
        }
    }, [userId]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

