import { router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';

// Bottom navigation icons
import BestsellingSvg from '../assets/HomePage/icons/bestselling.svg';
import FavouriteSvg from '../assets/HomePage/icons/favourite.svg';
import HomeSvg from '../assets/HomePage/icons/home.svg';
import RecommendationSvg from '../assets/HomePage/icons/recommendation.svg';
import SupportSvg from '../assets/HomePage/icons/support.svg';

const { width } = Dimensions.get('window');

type ExpandedSection = 'customer' | 'website' | 'whatsapp' | 'facebook' | 'instagram' | null;

export default function ContactUsScreen() {
  const [currentTime, setCurrentTime] = useState('');
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>(null);

  React.useEffect(() => {
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

  const toggleSection = (section: ExpandedSection) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const contactOptions = [
    {
      id: 'customer' as ExpandedSection,
      icon: '🎧',
      label: 'Customer service',
      content: 'Call us at: +60 12-345 6789\nEmail: support@jimatbite.com\nAvailable: Mon-Fri, 9AM-6PM'
    },
    {
      id: 'website' as ExpandedSection,
      icon: '🌐',
      label: 'Website',
      content: 'Visit our website at:\nwww.jimatbite.com\n\nFor more information about our services, menu, and locations.'
    },
    {
      id: 'whatsapp' as ExpandedSection,
      icon: '💬',
      label: 'Whatsapp',
      content: 'Chat with us on WhatsApp:\n+60 12-345 6789\n\nQuick responses during business hours!'
    },
    {
      id: 'facebook' as ExpandedSection,
      icon: '👥',
      label: 'Facebook',
      content: 'Follow us on Facebook:\nfacebook.com/jimatbite\n\nStay updated with our latest promotions and menu items!'
    },
    {
      id: 'instagram' as ExpandedSection,
      icon: '📷',
      label: 'Instagram',
      content: 'Follow us on Instagram:\n@jimatbite\n\nSee mouth-watering photos of our dishes!'
    }
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.timeText}>{currentTime}</Text>
      </View>

      {/* Top Navigation Bar */}
      <View style={styles.topNav}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <BackArrowLeftSvg width={24} height={24} />
        </Pressable>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Contact Us</Text>
          <Text style={styles.subtitle}>How Can We Help You?</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        <Pressable 
          style={styles.tabButton}
          onPress={() => router.push('./help-faq')}
        >
          <Text style={styles.tabText}>FAQ</Text>
        </Pressable>
        <Pressable 
          style={[styles.tabButton, styles.tabButtonActive]}
          onPress={() => {}}
        >
          <Text style={[styles.tabText, styles.tabTextActive]}>Contact Us</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.optionsContainer}>
          {contactOptions.map((option) => (
              <View key={option.id} style={styles.optionWrapper}>
                <Pressable
                  style={styles.optionButton}
                  onPress={() => toggleSection(option.id)}
                >
                  <View style={styles.optionLeft}>
                    <View style={styles.iconContainer}>
                      <Text style={styles.optionIcon}>{option.icon}</Text>
                    </View>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                  </View>
                  <Text style={styles.chevron}>
                    {expandedSection === option.id ? '▲' : '▼'}
                  </Text>
                </Pressable>
                
                {expandedSection === option.id && (
                  <View style={styles.expandedContent}>
                    <Text style={styles.expandedText}>{option.content}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => router.push('./home-page')}>
          <HomeSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.push('./best-seller-page')}>
          <BestsellingSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.push('./favorites-page')}>
          <FavouriteSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.push('./recommend-page')}>
          <RecommendationSvg width={28} height={28} />
        </Pressable>
        <Pressable style={styles.navItem}>
          <SupportSvg width={28} height={28} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3FFCF',
    top: -30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#F4FFC9',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F4FFC9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3FFCF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2E7D32',
  },
  subtitle: {
    fontSize: 14,
    color: '#4A9C4A',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#F3FFCF',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#1A5D1A',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A5D1A',
  },
  tabTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
  },
  optionsContainer: {
    paddingHorizontal: 16,
  },
  optionWrapper: {
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionIcon: {
    fontSize: 24,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  chevron: {
    fontSize: 12,
    color: '#FF6347',
    fontWeight: '700',
  },
  expandedContent: {
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginTop: -8,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#E8E8E8',
  },
  expandedText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  faqContainer: {
    paddingHorizontal: 16,
  },
  faqItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A5D1A',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  bottomNav: {
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
  navItem: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
