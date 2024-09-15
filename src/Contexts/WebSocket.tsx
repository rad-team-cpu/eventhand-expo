import { useAuth } from '@clerk/clerk-expo';
import React, { createContext, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Chat, ChatMessage, PaginationInfo } from 'types/types';

type SenderType = "CLIENT" | "VENDOR"

type PaginationInput = {
  pageNumber: number,
  pageSize: number,
}

type SocketInputType = "REGISTER" | "SEND_MESSAGE" | "GET_MESSAGES" | "GET_CHAT_LIST" | "SWITCH" | "GET_EARLIER_MESSAGES" | "GET_MORE_CHAT_LIST"

type SocketRegisterInput = {
  senderId: string,
  senderType: SenderType,
  inputType: SocketInputType,

}

type GetChatListInput =  SocketRegisterInput & PaginationInput

type GetMessagesInput = SocketRegisterInput & PaginationInput &  {
  receiverId: string,
}

type SendMessageInput = SocketRegisterInput & {
  chatId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isImage: boolean;
}

type SocketSwitchInput = SocketRegisterInput & {clerkId: string}


type SocketInput = SocketRegisterInput | GetChatListInput

type GetChatListOutput = {
    documents: Chat[];
    totalPages: number;
    currentPage: number;
    hasMore: boolean;
}

type GetMessagesOutput = {
  documents: ChatMessage[];
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
}



type WebSocketContextType = {
    isConnected: boolean;
    chatList: Chat[];
    chatListOptions: PaginationInfo
    sendMessage: (message: SocketInput) => void;
    reconnect: () => void;
    connectionTimeout: boolean;
    loadingChatList: boolean;
    websocketRef: React.MutableRefObject<WebSocket | null>;
  };

interface WebSocketProviderProps {
    children: ReactNode;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

const defaultPaginationOptions: PaginationInfo = {
  currentPage: 1,
  totalPages: 20,
  hasMore: false
}


const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
    const { getToken,  isLoaded } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [chatList, setChatList] = useState<Chat[]>([])
    const [chatListOptions, setChatListOptions] = useState<PaginationInfo>(defaultPaginationOptions)
    const [loadingChatList, setLoadingChatList] = useState<boolean>(false);
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
            console.log(`CONNECTING TO: ${process.env.EXPO_PUBLIC_WEBSOCKET_URL}`)

            socket.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
                setConnectionTimeout(false);
              };
          
              socket.onmessage = (event) => {
                const parsedData = JSON.parse(event.data)
                console.log('WEBSOCKET MESSAGE RECIEVED: ', parsedData.outputType);


                if(parsedData.outputType == "GET_CHAT_LIST" || parsedData.outputType === "GET_MORE_CHAT_LIST"){
                  setLoadingChatList(true)
                    const message: GetChatListOutput = {
                        ...parsedData.chatList,
                    }

                    const {hasMore, currentPage, totalPages} = message

                    setChatListOptions({
                      hasMore,
                      currentPage,
                      totalPages
                    })

                    if(parsedData.outputType === "GET_MORE_CHAT_LIST"){
                      setChatList(prevList => [...prevList, ...message.documents])
                    }else{
                      setChatList(message.documents)
                    }

                    setLoadingChatList(false)
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
        <WebSocketContext.Provider value={
          { isConnected, 
            sendMessage, 
            chatList, 
            chatListOptions, 
            reconnect, 
            connectionTimeout, 
            loadingChatList, 
            websocketRef
          }
        }>
          {children}
        </WebSocketContext.Provider>
      );
};

export  {WebSocketContext, WebSocketProvider, WebSocketContextType, SocketInput, GetChatListInput, GetChatListOutput, SocketRegisterInput, GetMessagesInput, GetMessagesOutput, SendMessageInput, SocketSwitchInput}



