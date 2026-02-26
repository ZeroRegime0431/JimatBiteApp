import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import BestsellingSvg from '../assets/HomePage/icons/bestselling.svg';
import FavouriteSvg from '../assets/HomePage/icons/favourite.svg';
import HomeSvg from '../assets/HomePage/icons/home.svg';
import RecommendationSvg from '../assets/HomePage/icons/recommendation.svg';
import SupportSvg from '../assets/HomePage/icons/support.svg';
import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';
import { getCurrentUser } from '../services/auth';
import { subscribeToConversations } from '../services/chat';
import { getMerchantProfile } from '../services/database';
import type { Conversation } from '../types';

export default function ChatListScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMerchant, setIsMerchant] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkMerchantStatus();
  }, []);

  const checkMerchantStatus = async () => {
    const user = getCurrentUser();
    if (user) {
      const merchantResult = await getMerchantProfile(user.uid);
      const merchantStatus = merchantResult.success && merchantResult.data;
      setIsMerchant(!!merchantStatus);
      
      // Check if this is the admin account
      const adminStatus = user.uid === 'a5L1LZoUCEZxcCeeWxFW7vIow323';
      setIsAdmin(adminStatus);
      
      loadConversations(!!merchantStatus);
    }
  };

  const loadConversations = async (merchantStatus: boolean) => {
    setLoading(true);
    const user = getCurrentUser();
    if (user) {
      // Set up real-time listener
      const unsubscribe = subscribeToConversations(
        user.uid,
        merchantStatus,
        (updatedConversations) => {
          setConversations(updatedConversations);
          setLoading(false);
        }
      );
      
      return () => unsubscribe();
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes < 1 ? 'Just now' : `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleConversationPress = (conversation: Conversation) => {
    router.push({
      pathname: '/chat-room',
      params: {
        conversationId: conversation.id,
        merchantId: conversation.merchantId,
        merchantName: conversation.merchantName,
        orderId: conversation.orderId || ''
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable 
          style={styles.headerIcon} 
          onPress={() => router.replace(isMerchant ? '/merchant-page' : '/home-page')}
        >
          <BackArrowLeftSvg width={22} height={22} />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.titleText}>{isAdmin ? 'All Messages (Admin)' : 'Messages'}</Text>
        </View>
        <View style={styles.headerIcon} />
      </View>

      {/* Content */}
      <View style={styles.contentWrapper}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1A5D1A" />
              <Text style={styles.loadingText}>Loading conversations...</Text>
            </View>
          ) : conversations.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>No conversations yet</Text>
              <Text style={styles.emptyStateSubtext}>
                {isAdmin
                  ? 'All customer-merchant conversations will appear here'
                  : isMerchant 
                    ? 'Customer messages will appear here' 
                    : 'Start chatting with merchants about your orders'}
              </Text>
            </View>
          ) : (
            conversations.map(conversation => (
              <Pressable
                key={conversation.id}
                style={styles.conversationCard}
                onPress={() => handleConversationPress(conversation)}
              >
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {isAdmin 
                        ? conversation.userName.charAt(0).toUpperCase()
                        : isMerchant 
                          ? (conversation.userName || 'U').charAt(0).toUpperCase()
                          : conversation.merchantName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  {conversation.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.conversationDetails}>
                  <View style={styles.conversationHeader}>
                    <Text style={styles.merchantName}>
                      {isAdmin 
                        ? `${conversation.userName} ↔ ${conversation.merchantName}`
                        : isMerchant 
                          ? (conversation.userName || 'Customer') 
                          : conversation.merchantName}
                    </Text>
                    <Text style={styles.timeText}>{formatTime(conversation.lastMessageTime)}</Text>
                  </View>
                  
                  {conversation.orderId && (
                    <Text style={styles.orderIdText}>Order #{conversation.orderId.slice(0, 8)}</Text>
                  )}
                  
                  <Text 
                    style={[
                      styles.lastMessage,
                      conversation.unreadCount > 0 && styles.lastMessageUnread
                    ]}
                    numberOfLines={1}
                  >
                    {conversation.lastMessage || 'Start a conversation'}
                  </Text>
                </View>

                <View style={styles.arrowContainer}>
                  <Text style={styles.arrow}>›</Text>
                </View>
              </Pressable>
            ))
          )}
        </ScrollView>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <Pressable style={styles.navIcon} onPress={() => router.replace('/home-page')}>
          <HomeSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navIcon} onPress={() => router.replace('/best-seller-page')}>
          <BestsellingSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navIcon} onPress={() => router.replace('/favorites-page')}>
          <FavouriteSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navIcon} onPress={() => router.replace('/recommend-page')}>
          <RecommendationSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navIcon} onPress={() => router.replace('/support-page')}>
          <SupportSvg width={28} height={28} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    paddingTop: Platform.OS === 'ios' ? 110 : 76,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F3FFCF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitleWrap: { flex: 1, alignItems: 'center' },
  titleText: { fontSize: 20, fontWeight: '600', color: '#1A5D1A' },
  
  contentWrapper: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyStateText: { fontSize: 18, fontWeight: '600', color: '#1A5D1A', marginBottom: 8 },
  emptyStateSubtext: { fontSize: 14, color: '#666', textAlign: 'center' },
  
  conversationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 5,
  },
  
  avatarContainer: { position: 'relative' },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1A5D1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '600', color: '#fff' },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  
  conversationDetails: { flex: 1, marginLeft: 12 },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  merchantName: { fontSize: 16, fontWeight: '600', color: '#000', flex: 1 },
  timeText: { fontSize: 12, color: '#999', marginLeft: 8 },
  orderIdText: { fontSize: 12, color: '#1A5D1A', marginBottom: 4 },
  lastMessage: { fontSize: 14, color: '#666' },
  lastMessageUnread: { fontWeight: '600', color: '#000' },
  
  arrowContainer: { marginLeft: 8 },
  arrow: { fontSize: 24, color: '#1A5D1A', fontWeight: '300' },
  
  bottomNavigation: {
    position: 'absolute',
    bottom: 18,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#1A5D1A',
    borderRadius: 34,
    elevation: 5,
  },
  navIcon: { alignItems: 'center', justifyContent: 'center', padding: 8 },
});
