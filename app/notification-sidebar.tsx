import React, { useEffect, useState } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

// SVG icons - reusing from existing assets
import HomeSvg from '../assets/HomePage/icons/home.svg';
import NotificationBellSvg from '../assets/NotificationSideBar/icons/notificationbell.svg';
import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';

// Notification icons
import FavouriteNotificationSvg from '../assets/NotificationSideBar/icons/favouritenotification.svg';
import OrderNotificationSvg from '../assets/NotificationSideBar/icons/ordernotification.svg';
import ProductNotificationSvg from '../assets/NotificationSideBar/icons/productnotification.svg';

const { width } = Dimensions.get('window');

interface NotificationSidebarProps {
  visible: boolean;
  onClose: () => void;
}

interface NotificationItem {
  id: string;
  icon: React.FC<any>;
  title: string;
  message: string;
}

export default function NotificationSidebar({ visible, onClose }: NotificationSidebarProps) {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const notifications: NotificationItem[] = [
    {
      id: '1',
      icon: ProductNotificationSvg,
      title: 'We have added a product you might like.',
      message: '',
    },
    {
      id: '2',
      icon: FavouriteNotificationSvg,
      title: 'One of your favorite is on promotion.',
      message: '',
    },
    {
      id: '3',
      icon: OrderNotificationSvg,
      title: 'Your order has been prepared.',
      message: '',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={styles.overlayTouchable} onPress={onClose} />
        <View style={styles.sidebar}>
          <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={onClose}>
              <BackArrowLeftSvg width={28} height={28} />
            </Pressable>
            <Text style={styles.timeText}>{currentTime}</Text>
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.titleSection}>
              <NotificationBellSvg width={38} height={28} fill="#fff" />
              <Text style={styles.titleText}>Notifications</Text>
            </View>

            <View style={styles.notificationContainer}>
              {notifications.map((notification) => {
                const IconComponent = notification.icon;
                return (
                  <Pressable 
                    key={notification.id} 
                    style={styles.notificationItem}
                    onPress={() => console.log('Notification pressed:', notification.id)}
                  >
                    <View style={styles.iconContainer}>
                      <IconComponent width={38} height={38} />
                    </View>
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      <Text style={styles.notificationMessage}>{notification.message}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.bottomIconScrollable}>
              <Pressable onPress={onClose}>
                <View style={styles.homeIconContainer}>
                  <HomeSvg width={24} height={24} />
                </View>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  sidebar: {
    width: width * 0.75,
    backgroundColor: '#1A5D1A',
    paddingTop: 50,
    paddingHorizontal: 0,
    elevation: 10,
    zIndex: 1000,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 12,
  },
  titleText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    top: -2,
    textAlign: 'center',
  },
  notificationContainer: {
    paddingHorizontal: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    marginBottom: 8,
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationTitle: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    top: -4,
  },
  notificationMessage: {
    fontSize: 13,
    color: '#E0E0E0',
    marginTop: 2,
  },
  bottomIconScrollable: {
    marginTop: 30,
    marginLeft: 10,
    marginBottom: 20,
  },
  homeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(45, 122, 45, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
