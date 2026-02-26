// Chat service for managing conversations and messages
import {
    addDoc,
    collection,
    doc,
    limit as firestoreLimit,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { ChatMessage, Conversation } from '../types';

// Admin merchant ID - can see all conversations
const ADMIN_MERCHANT_ID = 'a5L1LZoUCEZxcCeeWxFW7vIow323';

export interface ChatResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Get or create a conversation between user and merchant
 */
export async function getOrCreateConversation(
  userId: string,
  userName: string,
  merchantId: string,
  merchantName: string,
  orderId?: string
): Promise<ChatResult<Conversation>> {
  try {
    // Check if conversation already exists
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('userId', '==', userId),
      where('merchantId', '==', merchantId)
    );
    
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      // Return existing conversation
      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        success: true,
        data: {
          id: doc.id,
          ...data,
          lastMessageTime: data.lastMessageTime?.toDate(),
          createdAt: data.createdAt?.toDate(),
        } as Conversation
      };
    }
    
    // Create new conversation
    const newConversation = {
      userId,
      userName,
      merchantId,
      merchantName,
      orderId: orderId || null,
      lastMessage: '',
      lastMessageTime: serverTimestamp(),
      unreadCount: 0,
      unreadCountMerchant: 0,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(conversationsRef, newConversation);
    
    return {
      success: true,
      data: {
        id: docRef.id,
        ...newConversation,
        lastMessageTime: new Date(),
        createdAt: new Date(),
      } as Conversation
    };
  } catch (error: any) {
    console.error('Error getting/creating conversation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(userId: string): Promise<ChatResult<Conversation[]>> {
  try {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('userId', '==', userId),
      orderBy('lastMessageTime', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const conversations: Conversation[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastMessageTime: doc.data().lastMessageTime?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Conversation[];
    
    return { success: true, data: conversations };
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all conversations for a merchant
 */
export async function getMerchantConversations(merchantId: string): Promise<ChatResult<Conversation[]>> {
  try {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('merchantId', '==', merchantId),
      orderBy('lastMessageTime', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const conversations: Conversation[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastMessageTime: doc.data().lastMessageTime?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Conversation[];
    
    return { success: true, data: conversations };
  } catch (error: any) {
    console.error('Error fetching merchant conversations:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  text: string,
  isMerchant: boolean = false
): Promise<ChatResult<ChatMessage>> {
  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    
    const message = {
      text,
      createdAt: serverTimestamp(),
      user: {
        _id: senderId,
        name: senderName,
      },
      read: false,
      system: false,
    };
    
    const docRef = await addDoc(messagesRef, message);
    
    // Update conversation last message and unread count
    const conversationRef = doc(db, 'conversations', conversationId);
    const updateData: any = {
      lastMessage: text,
      lastMessageTime: serverTimestamp(),
    };
    
    if (isMerchant) {
      // Merchant sent message, increment user's unread count
      const conversationDoc = await getDoc(conversationRef);
      const currentUnread = conversationDoc.data()?.unreadCount || 0;
      updateData.unreadCount = currentUnread + 1;
    } else {
      // User sent message, increment merchant's unread count
      const conversationDoc = await getDoc(conversationRef);
      const currentUnread = conversationDoc.data()?.unreadCountMerchant || 0;
      updateData.unreadCountMerchant = currentUnread + 1;
    }
    
    await updateDoc(conversationRef, updateData);
    
    return {
      success: true,
      data: {
        _id: docRef.id,
        ...message,
        createdAt: new Date(),
      } as ChatMessage
    };
  } catch (error: any) {
    console.error('Error sending message:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get messages for a conversation
 */
export async function getMessages(
  conversationId: string,
  limitCount: number = 50
): Promise<ChatResult<ChatMessage[]>> {
  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(
      messagesRef,
      orderBy('createdAt', 'desc'),
      firestoreLimit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    const messages: ChatMessage[] = snapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as ChatMessage[];
    
    return { success: true, data: messages };
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark conversation messages as read
 */
export async function markConversationAsRead(
  conversationId: string,
  isMerchant: boolean = false
): Promise<ChatResult<void>> {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    
    if (isMerchant) {
      await updateDoc(conversationRef, {
        unreadCountMerchant: 0
      });
    } else {
      await updateDoc(conversationRef, {
        unreadCount: 0
      });
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error marking conversation as read:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Listen to messages in real-time
 */
export function subscribeToMessages(
  conversationId: string,
  onMessagesUpdate: (messages: ChatMessage[]) => void,
  onError?: (error: Error) => void
): () => void {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'desc'), firestoreLimit(50));
  
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const messages: ChatMessage[] = snapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as ChatMessage[];
      
      onMessagesUpdate(messages);
    },
    (error) => {
      console.error('Error subscribing to messages:', error);
      if (onError) onError(error);
    }
  );
  
  return unsubscribe;
}

/**
 * Listen to conversations in real-time
 */
export function subscribeToConversations(
  userId: string,
  isMerchant: boolean,
  onConversationsUpdate: (conversations: Conversation[]) => void,
  onError?: (error: Error) => void
): () => void {
  const conversationsRef = collection(db, 'conversations');
  
  // Check if this is the admin - admin sees ALL conversations
  let q;
  const isAdmin = isMerchant && userId === ADMIN_MERCHANT_ID;
  
  if (isAdmin) {
    // Admin: fetch all conversations
    q = query(
      conversationsRef,
      orderBy('lastMessageTime', 'desc')
    );
  } else {
    // Regular user or merchant: only their conversations
    q = query(
      conversationsRef,
      where(isMerchant ? 'merchantId' : 'userId', '==', userId),
      orderBy('lastMessageTime', 'desc')
    );
  }
  
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const conversations: Conversation[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastMessageTime: doc.data().lastMessageTime?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Conversation[];
      
      onConversationsUpdate(conversations);
    },
    (error) => {
      console.error('Error subscribing to conversations:', error);
      if (onError) onError(error);
    }
  );
  
  return unsubscribe;
}
