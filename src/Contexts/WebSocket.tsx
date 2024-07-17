import { useAuth } from '@clerk/clerk-expo';
import React, { createContext, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Chat } from 'types/types';

type SenderType = "CLIENT" | "VENDOR"

type SocketInputType = "REGISTER" | "SEND_MESSAGE" | "GET_MESSAGES" | "GET_CHAT_LIST" | "SWITCH"

type SocketRegisterInput = {
  senderId: string,
  senderType: SenderType,
}

type GetChatListInput =  SocketRegisterInput & {
    inputType: SocketInputType,
    pageNumber: number,
    pageSize: number,
}


type SocketInput = SocketRegisterInput | GetChatListInput

type GetChatListOutput = {
    documents: Chat[];
    totalPages: number;
    currentPage: number;
    hasMore: boolean;
}

type WebSocketContextType = {
    isConnected: boolean;
    messages: string[];
    chatList?: GetChatListOutput
    sendMessage: (message: SocketInput) => void;
    reconnect: () => void;
    connectionTimeout: boolean;
    loading: boolean
  };

interface WebSocketProviderProps {
    children: ReactNode;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);


const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
    const { getToken,  isLoaded } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [chatList, setChatList] = useState<GetChatListOutput | undefined>(undefined)
    const [messages, setMessages] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [connectionTimeout, setConnectionTimeout] = useState<boolean>(false);
    const websocketRef = useRef<WebSocket | null>(null);
    const reconnectionAttemptRef = useRef<number>(0)

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
                setLoading(true)
                const parsedData = JSON.parse(event.data)
                console.log('WEBSOCKET MESSAGE RECIEVED!:');
                console.log(`TYPE:`, parsedData.outputType)

                if(parsedData.outputType == "GET_CHAT_LIST"){
                    const message: GetChatListOutput = {
                        ...parsedData.chatList,
                    }

                    setChatList(message)
                    setLoading(false)
                }
            
              };
          
              socket.onclose = (event) => {
                console.log('WebSocket closed:', event.reason);
                setIsConnected(false);

                if(reconnectionAttemptRef.current != 3){
                  reconnectionAttemptRef.current = reconnectionAttemptRef.current + 1
                  setTimeout(connectWebSocket, 5000);
                }else{
                  console.log("WebSocket Connection Timeout");
                  setConnectionTimeout(true)
                }
              };
          
              socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                socket.close();
              };
              
              websocketRef.current = socket;

        } catch (error) {
            console.error('Failed to setup WebSocket', error);
        }
      }, [getToken, connectionTimeout]);

      const sendMessage = (message: SocketInput) => {
        if (websocketRef.current && isConnected) {
          const input = JSON.stringify(message)
          websocketRef.current.send(input);
        } else {
          console.warn('WebSocket is not connected. Unable to send message.');
        }
      };

      const reconnect = () => {
        reconnectionAttemptRef.current = 0
        setConnectionTimeout(false)
      }
    
      useEffect(() => {
        connectWebSocket();
        // Clean up WebSocket on unmount
        return () => {
          websocketRef.current?.close();
        };
      }, [connectWebSocket]);
    
      return (
        <WebSocketContext.Provider value={{ isConnected, messages, sendMessage, chatList, reconnect, connectionTimeout, loading }}>
          {children}
        </WebSocketContext.Provider>
      );
};

export  {WebSocketContext, WebSocketProvider, WebSocketContextType, SocketInput, GetChatListInput, SocketRegisterInput}



