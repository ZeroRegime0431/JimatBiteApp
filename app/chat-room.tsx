import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Bubble, GiftedChat, IMessage, InputToolbar, Send } from 'react-native-gifted-chat';
import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';
import { getCurrentUser } from '../services/auth';
import { getOrCreateConversation, markConversationAsRead, sendMessage, subscribeToMessages } from '../services/chat';
import { getMerchantProfile } from '../services/database';

export default function ChatRoomScreen() {
  const { conversationId, merchantId, merchantName, orderId, userId, userName } = useLocalSearchParams();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [isMerchant, setIsMerchant] = useState(false);
  const user = getCurrentUser();

  useEffect(() => {
    checkMerchantStatus();
  }, []);

  const checkMerchantStatus = async () => {
    if (!user) return;
    const merchantResult = await getMerchantProfile(user.uid);
    const merchantStatus = merchantResult.success && merchantResult.data;
    setIsMerchant(!!merchantStatus);
    initializeChat(!!merchantStatus);
  };

  const initializeChat = async (merchantStatus: boolean) => {
    if (!user) return;
    
    let convId = conversationId as string;
    
    // If no conversation ID, create one
    if (!convId || convId === '') {
      const result = await getOrCreateConversation(
        merchantStatus ? (userId as string) : user.uid,
        merchantStatus ? (userName as string) : (user.displayName || user.email || 'User'),
        merchantStatus ? user.uid : (merchantId as string),
        merchantStatus ? (user.displayName || user.email || 'Merchant') : (merchantName as string),
        orderId as string
      );
      
      if (result.success && result.data) {
        convId = result.data.id;
        setActiveConversationId(convId);
      }
    } else {
      setActiveConversationId(convId);
    }
    
    // Mark conversation as read when entering
    if (convId) {
      await markConversationAsRead(convId, merchantStatus);
    }
    
    // Subscribe to messages
    if (convId) {
      const unsubscribe = subscribeToMessages(
        convId,
        (chatMessages) => {
          // Convert ChatMessage to IMessage format
          const formattedMessages: IMessage[] = chatMessages.map(msg => ({
            _id: msg._id,
            text: msg.text,
            createdAt: msg.createdAt,
            user: msg.user,
            system: msg.system,
          }));
          
          setMessages(formattedMessages);
          setLoading(false);
        },
        (error) => {
          console.error('Error subscribing to messages:', error);
          setLoading(false);
        }
      );
      
      return () => unsubscribe();
    }
  };

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    if (!user || !activeConversationId) return;
    
    const message = newMessages[0];
    if (!message || !message.text) return;
    
    // Send message
    const result = await sendMessage(
      activeConversationId,
      user.uid,
      user.displayName || user.email || 'User',
      message.text,
      isMerchant
    );
    
    if (result.success) {
      // Message will be updated via real-time subscription
    }
  }, [user, activeConversationId, isMerchant]);

  const renderBubble = (props: any) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: '#E8F5E9',
            borderRadius: 16,
            borderTopLeftRadius: 4,
            padding: 4,
          },
          right: {
            backgroundColor: '#FFF9C4',
            borderRadius: 16,
            borderTopRightRadius: 4,
            padding: 4,
          },
        }}
        textStyle={{
          left: {
            color: '#000',
            fontSize: 15,
          },
          right: {
            color: '#000',
            fontSize: 15,
          },
        }}
        timeTextStyle={{
          left: {
            color: '#666',
            fontSize: 11,
          },
          right: {
            color: '#666',
            fontSize: 11,
          },
        }}
      />
    );
  };

  const renderInputToolbar = (props: any) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbar}
        primaryStyle={styles.inputPrimary}
      />
    );
  };

  const renderSend = (props: any) => {
    return (
      <Send {...props} containerStyle={styles.sendContainer}>
        <View style={styles.sendButton}>
          <Text style={styles.sendText}>➤</Text>
        </View>
      </Send>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A5D1A" />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <BackArrowLeftSvg width={24} height={24} />
        </Pressable>
        
        <View style={styles.headerContent}>
          <View style={styles.merchantAvatar}>
            <Text style={styles.merchantAvatarText}>
              {isMerchant 
                ? (userName as string || 'U').charAt(0).toUpperCase()
                : (merchantName as string).charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.merchantName}>
              {isMerchant ? (userName || 'Customer') : merchantName}
            </Text>
            {orderId && (
              <Text style={styles.orderIdText}>Order #{(orderId as string).slice(0, 8)}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.placeholder} />
      </View>

      {/* Chat Messages */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <GiftedChat
          messages={messages}
          onSend={messages => onSend(messages)}
          user={{
            _id: user?.uid || '',
            name: user?.displayName || user?.email || 'User',
          }}
          renderBubble={renderBubble}
          renderInputToolbar={renderInputToolbar}
          renderSend={renderSend}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FFD4',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FFD4',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F7FFD4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  merchantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A5D1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  merchantAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  orderIdText: {
    fontSize: 12,
    color: '#1A5D1A',
    marginTop: 2,
  },
  placeholder: {
    width: 44,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  inputToolbar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    minHeight: 80,
  },
  inputPrimary: {
    alignItems: 'center',
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A5D1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
