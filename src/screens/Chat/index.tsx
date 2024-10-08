import { Feather, MaterialIcons } from "@expo/vector-icons";
import { faker } from "@faker-js/faker";
import { ObjectId } from "bson";
import { UserContext } from "Contexts/UserContext";
import { VendorContext } from "Contexts/VendorContext";
import { GetMessagesInput, GetMessagesOutput, SendMessageInput, WebSocketContext } from "Contexts/WebSocket";
import { getInfoAsync } from "expo-file-system";
import {
  launchImageLibraryAsync,
  useMediaLibraryPermissions,
} from "expo-image-picker";
import React, { useState, useCallback, useEffect, useContext } from "react";
import { View, Image, StyleSheet, Pressable } from "react-native";
import {
  GiftedChat,
  BubbleProps,
  IMessage,
  Bubble,
  TimeProps,
  Time,
  Actions,
  SendProps,
  Send,
} from "react-native-gifted-chat";
import FirebaseService from "service/firebase";
import { Entypo } from "@expo/vector-icons";
import { ChatMessage, ChatScreenProps, HomeScreenNavigationProp, ImageInfo, PaginationInfo } from "types/types";
import { useNavigation } from "@react-navigation/native";

const firebaseService = FirebaseService.getInstance();

const CustomSend = (props: SendProps<IMessage>) => {
  return (
    <Send {...props} containerStyle={{justifyContent: "center"}}>
      <MaterialIcons name="send" size={24} color="#CB0C9F"  />
    </Send>
  )
}

const CustomMessageBubble = (props: BubbleProps<IMessage>) => {
  return (
    <Bubble
      {...props}
      wrapperStyle={{
        left: styles.senderBubble,
        right: styles.userBubble,
      }}
      textStyle={{ left: styles.messageText, right: styles.messageText }}
    />
  );
};

const CustomTimeStamp = (props: TimeProps<IMessage>) => {
  return (
    <Time
      {...props}
      timeTextStyle={{
        right: styles.timeStampText,
        left: styles.timeStampText,
      }}
    />
  );
};

const headerIcon = (image?: string) => {
  let source = { uri: image };
  const navigation = useNavigation<HomeScreenNavigationProp>();

  if (!image) {
    source = require("../../assets/images/user.png");
  }

  return (
    <View style={styles.leftHeaderContainer}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
        <Entypo name="chevron-left" size={24} color="#000" />
      </Pressable>
     <View style={styles.iconContainer}>
        <Image source={source} style={styles.icon} />
      </View>
    </View>
  );
};


const getFileInfo = async (fileURI: string) =>
  await getInfoAsync(fileURI, { size: true });

type MessageState = "OK" | "ERROR";


const defaultPaginationInfo: PaginationInfo = {
  currentPage: 1,
  totalPages: 20,
  hasMore: true
}

function Chat({ navigation, route }: ChatScreenProps) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [messageState, setMessageState] = useState<MessageState>("OK");
  const [page, setPage] = useState<number>(1)
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>(defaultPaginationInfo)
  const userContext = useContext(UserContext);
  const {_id, senderName, senderImage, senderId } = route.params;
  const { setOptions } = navigation;
  const [status, requestPermission] = useMediaLibraryPermissions();
  const vendorContext = useContext(VendorContext);
  const webSocket =  useContext(WebSocketContext);

  if(!webSocket){
    throw new Error("Component must be under Websocket Provider!!");
  }

  if (!vendorContext) {
    throw new Error("UserInfo must be used within a UserProvider");
  }

  if (!userContext) {
    throw new Error("UserInfo must be used within a UserProvider");
  }

  const { sendMessage,  isConnected, connectionTimeout, reconnect, websocketRef } = webSocket;
  const { user, mode } = userContext;
  const { vendor } = vendorContext;

  if(websocketRef.current === null){
    throw Error("Must be connected to a webSocket");
  }

  const wsRef = websocketRef.current;

  const convertToGiftedMessages = async (doc: ChatMessage) => {
      if(doc.isImage){
        const firebaseUrl =  await firebaseService.getProfilePicture(doc.content)

        return  {
          _id: doc._id,
          text:"",
          createdAt: doc.timestamp,
          user: {
            _id: doc.senderId,
          },
          image: firebaseUrl,
        } as IMessage
      }
      return {
        _id: doc._id,
        text: doc.content,
        createdAt: doc.timestamp,
        user:{
          _id: doc.senderId,
        }
      } as IMessage
  }

  const onLoadEarlier = () => {
    setPage(page => {
      const newPage =  page + 1
      if(paginationInfo.hasMore){
        const getMessagesInput: GetMessagesInput = {
          senderId: (mode === "CLIENT")? user._id: vendor.id,
          senderType: (mode === "CLIENT")? "CLIENT" : "VENDOR",
          receiverId: senderId,
          pageNumber: newPage,
          pageSize: 20,
          inputType: "GET_EARLIER_MESSAGES"
        };
        
        sendMessage(getMessagesInput);
      }
      
      return newPage
    })
  }

  const isParticipant = (id: string) => {
    if(mode === "CLIENT"){
      return id === senderId || id === user._id
    }
    if(mode === "VENDOR"){
      return id === senderId || id === vendor.id;
    }  };

  const chatHandler = useCallback(async (message: MessageEvent) => {
    const parsedData = JSON.parse(message.data)
    const { outputType } = parsedData;

    if(outputType === "GET_MESSAGES" || outputType === "GET_EARLIER_MESSAGES") {
      const messageList: GetMessagesOutput = {
        ...parsedData.messageList
      }
  
      const {hasMore, currentPage, totalPages} = messageList
  
        setPaginationInfo({
          hasMore,
          currentPage,
          totalPages
      })
  
      const chatMessages = messageList.documents
      
      const convertedMessages:IMessage[] = await Promise.all(chatMessages.map(convertToGiftedMessages)).catch(err =>{ 
        console.error(err) 
          return [{
              _id: new ObjectId().toString(),
              text: "Failed to load Messages",
              createdAt: new Date(),
              system: true,
              user: {
                _id: (mode === "CLIENT")? user._id: vendor.id,
              },
            }]
        })
      
      if(outputType === "GET_EARLIER_MESSAGES"){
        setMessages(prevMessages => GiftedChat.prepend(prevMessages, convertedMessages));
      } else {
        setMessages(convertedMessages);
      }
    }

    if(outputType === 'CHAT_MESSAGE_RECEIVED'){
      const message: ChatMessage = {
        ...parsedData.message
      }

      if(isParticipant(message.senderId)){
        const convertedMessage: IMessage = await convertToGiftedMessages(message)

        setMessages( prevMessages => GiftedChat.append(prevMessages, [ convertedMessage ]) )
      }
    }
    
  }, [])


  useEffect(() => {
    setOptions({
      headerTitle: senderName,
      headerLeft: () => headerIcon(senderImage),
    });

    wsRef.addEventListener("message", chatHandler)


    if(!isConnected){
      const sysMessage: IMessage = {
        _id: new ObjectId().toString(),
        text: "No Internet Connection",
        createdAt: new Date(),
        system: true,
        user: {
          _id: (mode === "CLIENT")? user._id: vendor.id,
        },
      }
    
      setMessages((previousMessage) =>
        GiftedChat.append(previousMessage, [ sysMessage ]),
      );
    }

    return () => {
      if(wsRef){
        wsRef.removeEventListener("message", chatHandler);
      }
    }

  }, [ connectionTimeout, isConnected]);

  const onSend = useCallback((messages: IMessage[] = []) => {
    const message = messages[0];

    const sendMessageInput: SendMessageInput = {
      chatId: _id,
      senderId: (mode === "CLIENT")? user._id: vendor.id,
      receiverId: senderId,
      content: message.text,
      timestamp: message.createdAt as Date,
      isImage: false,
      senderType: mode,
      inputType: "SEND_MESSAGE"
    }

    sendMessage(sendMessageInput);


    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, messages),
    );
  }, []);

  return (
    <GiftedChat
      messages={messages}
      onSend={(messages) => onSend(messages)}
      renderBubble={CustomMessageBubble}
      renderTime={CustomTimeStamp}
      renderSend={CustomSend}
      renderAvatar={null}
      user={{
        _id: (mode === "CLIENT")? user._id: vendor.id,
      }}
      loadEarlier={paginationInfo.hasMore}
      infiniteScroll
      onLoadEarlier={onLoadEarlier}
      renderActions={(props) => {

        const pickImageAsync = async () => {
          const permission = await requestPermission();

          if (!permission.granted) {
            alert(
              "You have denied access to media library. Please select allow to upload photo",
            );
          }

          const result = await launchImageLibraryAsync({
            quality: 1,
          });

          if (!result.canceled) {
            const image = result.assets[0];
            const imageFileInfo = await getFileInfo(image.uri);
            const fileExtension = image.fileName
              ? image.fileName.split(".").pop()
              : "";
            const mimeType = image.mimeType ? image.mimeType : "";

            const selectedImageInfo: ImageInfo = {
              uri: image.uri,
              fileSize: imageFileInfo.size,
              mimeType,
              fileExtension,
            };

            try {
              const messageId = new ObjectId()

              const result = await firebaseService.uploadMessageImage(_id, messageId.toString(), selectedImageInfo)

              const image = {
                _id: messageId.toString(),
                text:"",
                createdAt: new Date(),
                user: {
                  _id: (mode === "CLIENT")? user._id: vendor.id,                  
                },
                image: selectedImageInfo.uri,
              }

              const sendMessageInput: SendMessageInput = {
                chatId: _id,
                senderId: (mode === "CLIENT")? user._id: vendor.id,
                receiverId: senderId,
                content: result.metadata.fullPath,
                timestamp: new Date(),
                isImage: true,
                senderType: mode,
                inputType: "SEND_MESSAGE"
              }
          
              sendMessage(sendMessageInput);

              setMessages((previousMessage) =>
                GiftedChat.append(previousMessage, [image]),
              );
              
            } catch (error: any) {
              const sysMessage: IMessage = {
                  _id: new ObjectId().toString(),
                  text: "Error uploading image",
                  createdAt: new Date(),
                  system: true,
                  user: {
                    _id: (mode === "CLIENT")? user._id: vendor.id,
                  },
                }
              
              console.error(error)
              setMessageState("ERROR");
              setMessages((previousMessage) =>
                GiftedChat.append(previousMessage, [sysMessage]),
              );
            }
          } else {
            alert("You did not select any image.");
          }
        };

        const selectImage = () => pickImageAsync();

        return (
          <Actions
            {...props}
            icon={() => <Feather name="upload" size={20} color="#CB0C9F" />}
            onPressActionButton={() => selectImage()}
          />
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  senderBubble: {
    borderRadius: 15,
    backgroundColor: "#e5a435",
    marginVertical: 5

  },
  userBubble: {
    borderRadius: 15,
    backgroundColor: "#CB0C9F",
    marginVertical: 5
  },
  messageText: {
    color: "#ffff",
    fontSize: 16,
  },
  timeStampText: {
    color: "#ffff",
  },
  leftHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  icon: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Chat;
