import { Entypo } from "@expo/vector-icons";
import { faker } from "@faker-js/faker";
import React, { useState, useCallback, useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import {
  GiftedChat,
  BubbleProps,
  IMessage,
  Bubble,
  TimeProps,
  Time,
} from "react-native-gifted-chat";
import { ChatScreenProps } from "types/types";

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

function Chat({ navigation, route }: ChatScreenProps) {
  const [messages, setMessages] = useState([]);
  const { senderName, senderImage } = route.params;
  const { setOptions } = navigation;

  useEffect(() => {
    setOptions({
      headerTitle: senderName,
      headerLeft: () => headerIcon(senderImage),
    });

    setMessages([
      {
        _id: 1,
        text: "Hello developer",
        createdAt: new Date(),
        user: {
          _id: 2,
          name: "React Native",
          avatar: faker.image.avatar(),
        },
      },
      {
        _id: 2,
        createdAt: new Date(Date.UTC(2016, 5, 11, 17, 20, 0)),
        user: {
          _id: 2,
          name: "React Native",
          avatar: faker.image.avatar(),
        },
        image: faker.image.url(),
        // You can also add a video prop:
        // Mark the message as sent, using one tick
        sent: true,
        // Mark the message as received, using two tick
        received: true,
        // Mark the message as pending with a clock loader
        pending: true,
        // Any additional custom parameters are passed through
      },
    ]);
  }, []);

  const onSend = useCallback((messages = []) => {
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
      renderAvatar={null}
      user={{
        _id: 1,
      }}
      loadEarlier
      infiniteScroll
    />
  );
}

const styles = StyleSheet.create({
  senderBubble: {
    borderRadius: 15,
    backgroundColor: "#e5a435",
  },
  userBubble: {
    borderRadius: 15,

    backgroundColor: "#CB0C9F",
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
