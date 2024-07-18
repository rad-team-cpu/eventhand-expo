import { Feather, MaterialIcons } from "@expo/vector-icons";
import { faker } from "@faker-js/faker";
import { UserContext } from "Contexts/UserContext";
import { GetMessagesInput, WebSocketContext } from "Contexts/WebSocket";
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
import Loading from "screens/Loading";
import FirebaseService from "service/firebase";
import { ChatMessage, ChatScreenProps, ImageInfo } from "types/types";
import { v4 as uuidv4 } from "uuid";
import { object, string, number, ValidationError } from "yup";

const isYupValidationError = (error: any) => {
  return (
    Array.isArray(error.errors) &&
    error.errors.every((perm: any) => typeof perm === "string")
  );
};

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
    source = require("../../../assets/images/user.png");
  }

  return (
    <View style={styles.iconContainer}>
      <Image source={source} style={styles.icon} />
    </View>
  );
};

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
  const webSocket =  useContext(WebSocketContext);

  if(!webSocket){
    throw new Error("Component must be under Websocket Provider!!");
  }


  if (!userContext) {
    throw new Error("UserInfo must be used within a UserProvider");
  }

  const { sendMessage, chatMessages, loading, isConnected, connectionTimeout, reconnect } = webSocket;
  const { user } = userContext;


  const getMessages = () => {
    if(chatMessages){
      const { hasMore} = chatMessages;
      
      if(hasMore){
        const getMessagesInput: GetMessagesInput = {
          senderId: user._id,
          senderType: "CLIENT",
          chatId: _id,
          pageNumber: page,
          pageSize: 15,
          inputType: "GET_MESSAGES"
        };

        sendMessage(getMessagesInput)
      }
    }

  }


  useEffect(() => {
    setOptions({
      headerTitle: senderName,
      headerLeft: () => headerIcon(senderImage),
    });

    if(isConnected){
      if(chatMessages){
        const { documents } = chatMessages;
        if(documents){
          const giftedChatMessages:IMessage[] = documents.map((doc: ChatMessage) => {
            return {
              _id: doc._id,
              text: doc.content,
              createdAt: doc.timestamp,
              user:{
                _id: doc.senderId,
                name: senderName,
                avatar: senderImage
              }
            }
          })
          setMessages(giftedChatMessages);
        }

      }

    }

  }, [page, chatMessages]);

  const onSend = useCallback((messages: IMessage[] = []) => {
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
        _id: user._id,
      }}
      loadEarlier
      infiniteScroll
      renderActions={(props) => {
        const firebaseService = FirebaseService.getInstance();

        const imageValidationSchema = object({
          fileSize: number().max(
            5242880,
            "File size too large, must be below 5mb",
          ),
          uri: string(),
          mimeType: string().matches(/^image\/(png|jpeg)$/, {
            message: "File must be a png or jpeg",
            excludeEmptyString: true,
          }),
          fileExtension: string().matches(/^(png|jpe?g)$/, {
            message: "File must be a png or jpeg",
            excludeEmptyString: true,
          }),
        });

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
              const validImage =
                await imageValidationSchema.validate(selectImage);



            } catch (error: any) {
              let sysMessage: IMessage;
              if (isYupValidationError(error)) {
                sysMessage = {
                  _id: uuidv4(),
                  text: error.errors[0],
                  createdAt: new Date(Date.UTC(2016, 5, 11, 17, 20, 0)),
                  system: true,
                  user: {
                    _id,
                  },
                };
              } else {
                sysMessage = {
                  _id: uuidv4(),
                  text: "A Error has occured",
                  createdAt: new Date(Date.UTC(2016, 5, 11, 17, 20, 0)),
                  system: true,
                  user: {
                    _id,
                  },
                };
              }

              setMessageState("ERROR");
              setMessages((previousMessage) =>
                GiftedChat.append(previousMessage, [sysMessage]),
              );
            }
            // onChange(selectedImageInfo);
          } else {
            alert("You did not select any image.");
          }
          // setLoading(false);
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
