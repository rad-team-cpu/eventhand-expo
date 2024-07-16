import { faker } from "@faker-js/faker";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "Contexts/UserContext";
import { GetChatListInput, WebSocketContext } from "Contexts/WebSocket";
import { format } from "date-fns/format";
import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  Pressable,
  ImageSourcePropType,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Chat, HomeScreenNavigationProp } from "types/types";

// Sample data
const chatData = [
  {
    id: "1",
    senderName: "John Doe",
    partialMessage: "Hey, how are you?",
    lastDateSent: new Date(),
    userImage: faker.image.avatar(),
  },
  {
    id: "2",
    senderName: "Jane Smith",
    partialMessage:
      "Can we meet tomorrow? I need to discuss something important with you regarding our upcoming project and some new ideas I have in mind.",
    lastDateSent: new Date(),
    userImage: faker.image.avatar(),
  },
  {
    id: "3",
    senderName: "John Doe",
    partialMessage: "Hey, how are you?",
    lastDateSent: new Date(),
    userImage: faker.image.avatar(),
  },
  {
    id: "4",
    senderName: "Jane Smith",
    partialMessage:
      "Can we meet tomorrow? I need to discuss something important with you regarding our upcoming project and some new ideas I have in mind.",
    lastDateSent: new Date(),
    userImage: faker.image.avatar(),
  },
  // Add more chat data as needed
];

const createChatData = () => {
  const chat: Chat = {
    _id: faker.string.uuid(),
    senderImage: faker.image.avatar(),
    senderName: faker.person.fullName(),
    latestMessage: faker.lorem.sentences(),
    timestamp: faker.date.anytime(),
  };

  return chat;
};

const data: Chat[] = Array.from(Array(10), () => createChatData());

const ChatItem: React.FC<Chat> = ({
  _id,
  senderImage,
  senderName,
  latestMessage,
  timestamp,
}) => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const formattedDate = format(timestamp!, "PPpp");
  const image: ImageSourcePropType = senderImage
    ? { uri: senderImage }
    : require("../../../assets/images/user.png");



  const onPress = () => {
    navigation.navigate("Chat", { _id, senderImage, senderName });

  };

  return (
    <Pressable
      testID="test-chat-item"
      style={styles.chatItem}
      onPress={onPress}
      android_ripple={{ color: " #d3d3d3" }}
    >
      <Image
        testID="test-sender-image"
        source={image}
        style={styles.userImage}
      />
      <View style={styles.messageContainer}>
        <Text testID="test-sender-name" style={styles.senderName}>
          {senderName}
        </Text>
        <View style={styles.row}>
          <Text
            testID="test-sender-partial-message"
            style={styles.partialMessage}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {latestMessage}
          </Text>
        </View>
        <View style={styles.separator} />
        <Text testID="test-last-date-sent" style={styles.lastDateSent}>
          {formattedDate}
        </Text>
      </View>
    </Pressable>
  );
};

function ChatList() {
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const userContext = useContext(UserContext);
  const webSocket =  useContext(WebSocketContext);

  if(!userContext){
    throw new Error("Component must be under User Provider!!")
  } 

  if(!webSocket){
    throw new Error("Component must be under Websocket Provider!!");
  }

  const {user } = userContext;
  const { sendMessage, chatList } = webSocket;

  useEffect(() => {
    const getChatListInput: GetChatListInput = {
      senderId: user._id,
      senderType: "CLIENT",
      pageNumber: page,
      pageSize: 10,
      inputType: "GET_CHAT_LIST"
    }

    sendMessage(getChatListInput);
  }, [page])

  return (
    <SafeAreaView>
      <FlatList
        data={chatList}
        renderItem={({ item }) => <ChatItem {...item} />}
        keyExtractor={({ _id }) => _id}
        onEndReached={ () => setPage(prevPage => prevPage + 1)}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator size="large" /> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: "#ffff",
    elevation: 2, // Add shadow for floating effect
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  messageContainer: {
    flex: 1,
  },
  senderName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 5,
  },
  partialMessage: {
    fontSize: 14,
    color: "#555",
  },
  lastDateSent: {
    marginLeft: 10,
    fontSize: 12,
    color: "#999",
    flexShrink: 0,
    textAlign: "right",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa', // Light background color
  },
  emptyText: {
    fontSize: 18,
    color: '#6c757d', // Muted text color
  },
});

export default ChatList;
