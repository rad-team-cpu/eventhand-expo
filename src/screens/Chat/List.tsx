import { faker } from '@faker-js/faker';
import { useNavigation } from '@react-navigation/native';
import ErrorScreen from 'Components/Error';
import Block from 'Components/Ui/Block';
import Image from 'Components/Ui/Image';
import { UserContext } from 'Contexts/UserContext';
import { VendorContext } from 'Contexts/VendorContext';
import {
  GetChatListInput,
  GetMessagesInput,
  WebSocketContext,
} from 'Contexts/WebSocket';
import { format } from 'date-fns/format';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  ImageSourcePropType,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useTheme from 'src/core/theme';
import {
  Chat,
  ChatListScreenPropsList,
  HomeScreenNavigationProp,
} from 'types/types';

interface ChatItemProps extends Chat {
  onItemPress?: (item: Chat) => void;
}

const ChatItem: React.FC<ChatItemProps> = ({
  _id,
  senderId,
  senderImage,
  senderName,
  latestMessage,
  isImage,
  timestamp,
  onItemPress,
}) => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const formattedDate = format(timestamp!, 'Pp');
  const image: ImageSourcePropType = senderImage
    ? { uri: senderImage }
    : require('../../assets/images/user.png');

  const onPress = () => {
    navigation.navigate('Chat', { _id, senderId, senderImage, senderName });
    if (onItemPress) {
      onItemPress({
        _id,
        senderId,
        senderImage,
        senderName,
        latestMessage,
        timestamp,
      });
    }
  };

  return (
    <Block>
      <Block flex={0} style={{ zIndex: 0 }}></Block>
      <Pressable
        testID='test-chat-item'
        style={styles.chatItem}
        onPress={onPress}
        android_ripple={{ color: ' #d3d3d3' }}
      >
        <Image
          testID='test-sender-image'
          source={image}
          style={styles.userImage}
        />
        <View style={styles.messageContainer}>
          <Text testID='test-sender-name' style={styles.senderName}>
            {senderName}
          </Text>
          <View style={styles.row}>
            <Text
              testID='test-sender-partial-message'
              style={styles.partialMessage}
              numberOfLines={2}
              ellipsizeMode='tail'
            >
              {isImage ? 'Sent an Image ' : latestMessage}
            </Text>
          </View>
          <View style={styles.separator} />
          <Text testID='test-last-date-sent' style={styles.lastDateSent}>
            {formattedDate}
          </Text>
        </View>
      </Pressable>
    </Block>
  );
};

function ChatList({ route }: ChatListScreenPropsList) {
  const [page, setPage] = useState<number>(1);
  const userContext = useContext(UserContext);
  const vendorContext = useContext(VendorContext);
  const webSocket = useContext(WebSocketContext);
  const { mode } = route.params;

  if (!userContext) {
    throw new Error('Component must be under User Provider!!');
  }

  if (!vendorContext) {
    throw new Error('UserInfo must be used within a UserProvider');
  }

  if (!webSocket) {
    throw new Error('Component must be under Websocket Provider!!');
  }

  const { vendor } = vendorContext;
  const { user } = userContext;
  const { sendMessage, chatList, chatListOptions, loadingChatList } = webSocket;

  const getChatList = useCallback(() => {
    setPage((prevPage) => prevPage + 1);
    const getChatListInput: GetChatListInput = {
      senderId: mode === 'CLIENT' ? user._id : vendor.id,
      senderType: mode,
      pageNumber: page,
      pageSize: 10,
      inputType: 'GET_MORE_CHAT_LIST',
    };

    sendMessage(getChatListInput);
  }, [page]);

  useEffect(() => {
    if (chatListOptions.hasMore) {
      getChatList();
    }
  }, [getChatList]);

  const renderEmptyComponent = () => {
    const { assets, colors, sizes, gradients } = useTheme();
    return (
      <Block safe>
        <View testID='test-chats' style={styles.container}>
          <Image
            background
            resizeMode='cover'
            padding={sizes.md}
            source={assets.noMessages}
            rounded
            className='rounded-xl h-60 w-64'
          ></Image>
          <Text className='font-bold'>You have no messages!</Text>
        </View>
      </Block>
    );
  };

  if (chatList.length == 0) {
    return renderEmptyComponent();
  }

  const renderFooter = () => {
    if (loadingChatList) {
      return <ActivityIndicator size='large' color='#CB0C9F' />;
    }
    if (!chatListOptions.hasMore) {
      return (
        <Text style={{ textAlign: 'center', padding: 10 }}>
          No more messages
        </Text>
      );
    }
    return null;
  };

  const onItemPress = (args: Chat) => {
    const getMessagesInput: GetMessagesInput = {
      senderId: mode === 'CLIENT' ? user._id : vendor.id,
      senderType: mode === 'CLIENT' ? 'CLIENT' : 'VENDOR',
      receiverId: args.senderId,
      pageNumber: 1,
      pageSize: 20,
      inputType: 'GET_MESSAGES',
    };

    sendMessage(getMessagesInput);
  };

  const data = chatList;

  return (
    <SafeAreaView>
      <Text className='pt-4 pl-6 mb-2 font-bold text-2xl text-pink-600'>
        Chat
      </Text>
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <ChatItem {...item} onItemPress={onItemPress} />
        )}
        keyExtractor={({ _id }) => _id}
        onEndReached={() => setPage((page) => page + 1)}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#ffff',
    elevation: 2, 
    shadowColor: '#000',
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
    fontWeight: 'bold',
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#E8AE4C',
    marginVertical: 5,
  },
  partialMessage: {
    fontSize: 14,
    color: '#555',
  },
  lastDateSent: {
    marginLeft: 10,
    fontSize: 12,
    color: '#999',
    flexShrink: 0,
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa', 
  },
  emptyText: {
    fontSize: 18,
    color: '#6c757d', 
  },
});

export default ChatList;
