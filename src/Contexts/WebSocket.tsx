import { useAuth } from '@clerk/clerk-expo';
import React, { createContext, ReactNode, useCallback, useEffect, useRef, useState } from 'react';

type WebSocketContextType = {
    isConnected: boolean;
    messages: string[];
    sendMessage: (message: string) => void;
  };

interface WebSocketProviderProps {
    children: ReactNode;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);


const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
    const { getToken,  isLoaded } = useAuth();
    const [socket, setSocket] = useState<WebSocket | undefined>(undefined);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<string[]>([]);
    const websocketRef = useRef<WebSocket | null>(null);

    if (!isLoaded){
        throw Error("Clerk Failed to initialize");
    }

    const connectWebSocket = useCallback(async () => {
        try {
            const token = await getToken({ template: "event-hand-jwt" });
            const url = `${process.env.EXPO_PUBLIC_WEBSOCKET_URL}?token=${token}`;
            const socket = new WebSocket(url);
            socket.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
              };
          
              socket.onmessage = (event) => {
                console.log('WebSocket message received:', event.data);
                setMessages((prevMessages) => [...prevMessages, event.data]);
              };
          
              socket.onclose = (event) => {
                console.log('WebSocket closed:', event.reason);
                setIsConnected(false);
                // Try to reconnect in 5 seconds
                setTimeout(connectWebSocket, 5000);
              };
          
              socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                socket.close();
              };
          
              websocketRef.current = socket;

        } catch (error) {
            console.error('Failed to setup WebSocket', error);
        }
      }, [getToken]);

      const sendMessage = (message: string) => {
        if (websocketRef.current && isConnected) {
          websocketRef.current.send(message);
        } else {
          console.warn('WebSocket is not connected. Unable to send message.');
        }
      };
    
      useEffect(() => {
        connectWebSocket();
        // Clean up WebSocket on unmount
        return () => {
          websocketRef.current?.close();
        };
      }, [connectWebSocket]);
    
      return (
        <WebSocketContext.Provider value={{ isConnected, messages, sendMessage }}>
          {children}
        </WebSocketContext.Provider>
      );
};

export  {WebSocketContext, WebSocketProvider, WebSocketContextType}



