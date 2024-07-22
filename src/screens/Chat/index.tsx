import { Feather, MaterialIcons } from "@expo/vector-icons";
import { faker } from "@faker-js/faker";
import { ObjectId } from "bson";
import { UserContext } from "Contexts/UserContext";
import { VendorContext } from "Contexts/VendorContext";
import { GetMessagesInput, SendMessageInput, WebSocketContext } from "Contexts/WebSocket";
import { getInfoAsync } from "expo-file-system";
import {
  launchImageLibraryAsync,
  useMediaLibraryPermissions,
} from "expo-image-picker";
import React, { useState, useCallback, useEffect, useContext } from "react";
import { View, Image, StyleSheet } from "react-native";
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
import { ChatMessage, ChatScreenProps, ImageInfo } from "types/types";

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

  if (!image) {
    source = require("../../assets/images/user.png");
  }

  return (
    <View style={styles.iconContainer}>
      <Image source={source} style={styles.icon} />
    </View>
  );
};

// const renderChatActions = (props) = (onPressActionButton: ) => {

//   return (
//     <Actions
//       icon={() => <Feather name="upload" size={20} color="#CB0C9F" />}
//       onPressActionButton={() => selectImage()}
//     />
//   );
// }

const getFileInfo = async (fileURI: string) =>
  await getInfoAsync(fileURI, { size: true });

type MessageState = "OK" | "ERROR";

function Chat({ navigation, route }: ChatScreenProps) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [messageState, setMessageState] = useState<MessageState>("OK");
  const [page, setPage] = useState<number>(1)
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

  const { sendMessage, chatMessages, loading, isConnected, connectionTimeout, reconnect } = webSocket;
  const { user, mode } = userContext;
  const { vendor } = vendorContext;


  const getMessages = () => {
    if(chatMessages){
      const { hasMore } = chatMessages;
      
      if(hasMore){
        const getMessagesInput: GetMessagesInput = {
          senderId: (mode === "CLIENT")? user._id: vendor.id,
          senderType: "CLIENT",
          receiverId: _id,
          pageNumber: page,
          pageSize: 15,
          inputType: "GET_MESSAGES"
        };

        sendMessage(getMessagesInput)
      }
    }

  }

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
        }
      }
      return {
        _id: doc._id,
        text: doc.content,
        createdAt: doc.timestamp,
        user:{
          _id: doc.senderId,
        }
      }
  }

  const fetchMessages = useCallback(async () => {
    if(isConnected){
      if(chatMessages){
        const { documents } = chatMessages;
        if(documents){
          const giftedChatMessages:IMessage[] = await Promise.all(documents.map(convertToGiftedMessages)).catch(err =>{ 
            console.error(err) 
            return [ {
              _id: new ObjectId().toString(),
              text: "Failed to load Messages",
              createdAt: new Date(),
              system: true,
              user: {
                _id: (mode === "CLIENT")? user._id: vendor.id,
              },
            }]
          })
          setMessages(giftedChatMessages);
        }
      }
    }
  }, [chatMessages])



  useEffect(() => {
    setOptions({
      headerTitle: senderName,
      headerLeft: () => headerIcon(senderImage),
    });


    fetchMessages();

    if(connectionTimeout){
      reconnect();
    }

  }, [page, fetchMessages, connectionTimeout]);

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
      loadEarlier
      infiniteScroll
      renderActions={(props) => {

        const pickImageAsync = async () => {
          // setLoading(true);
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
              const result = await firebaseService.uploadMessageImage(_id, selectedImageInfo)

              const image = {
                _id: 1,
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
