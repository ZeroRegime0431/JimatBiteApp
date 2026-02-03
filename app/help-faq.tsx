import { router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';

// Bottom navigation icons
import BestsellingSvg from '../assets/HomePage/icons/bestselling.svg';
import FavouriteSvg from '../assets/HomePage/icons/favourite.svg';
import HomeSvg from '../assets/HomePage/icons/home.svg';
import RecommendationSvg from '../assets/HomePage/icons/recommendation.svg';
import SupportSvg from '../assets/HomePage/icons/support.svg';

const { width } = Dimensions.get('window');

type CategoryType = 'General' | 'Account' | 'Services';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: CategoryType;
}

export default function HelpFAQScreen() {
  const [currentTime, setCurrentTime] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('General');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const faqData: FAQItem[] = [
    {
      id: 1,
      question: 'How do I place an order?',
      answer: 'Browse through our menu categories, select items you want, add them to your cart, and proceed to checkout. You can pay using various methods including credit card, debit card, or e-wallet.',
      category: 'General'
    },
    {
      id: 2,
      question: 'What are your delivery hours?',
      answer: 'We deliver daily from 9:00 AM to 10:00 PM. Delivery times may vary based on your location, order volume, and weather conditions. We aim to deliver within 30-45 minutes.',
      category: 'General'
    },
    {
      id: 3,
      question: 'Can I cancel my order?',
      answer: 'Yes, you can cancel your order within 5 minutes of placing it. Go to My Orders > Active Orders and select the order you wish to cancel. After 5 minutes, cancellation may not be possible as preparation begins.',
      category: 'General'
    },
    {
      id: 4,
      question: 'How do I track my order?',
      answer: 'Track your order in real-time from the My Orders section. You\'ll see the current status (Pending, Confirmed, Preparing, On the Way) and estimated delivery time. You can also scan the QR code upon delivery.',
      category: 'General'
    },
    {
      id: 5,
      question: 'How do I create an account?',
      answer: 'Tap the Sign Up button on the login page. Enter your email, create a password, and verify your email address. You can also sign up using Google or Facebook for faster registration.',
      category: 'Account'
    },
    {
      id: 6,
      question: 'I forgot my password. What should I do?',
      answer: 'Click on "Forgot Password" on the login page. Enter your registered email address, and we\'ll send you a password reset link. Follow the instructions in the email to create a new password.',
      category: 'Account'
    },
    {
      id: 7,
      question: 'How do I update my profile information?',
      answer: 'Go to Profile > Settings. You can update your name, email, phone number, and delivery addresses. Make sure to save changes before exiting.',
      category: 'Account'
    },
    {
      id: 8,
      question: 'Can I save multiple delivery addresses?',
      answer: 'Yes, you can save multiple delivery addresses in your profile. During checkout, you can select which address to use for that specific order.',
      category: 'Account'
    },
    {
      id: 9,
      question: 'What payment methods do you accept?',
      answer: 'We accept credit cards (Visa, Mastercard), debit cards, e-wallets (Touch \'n Go, GrabPay, Boost), and online banking. You can save your preferred payment method for faster checkout.',
      category: 'Services'
    },
    {
      id: 10,
      question: 'Is there a minimum order amount?',
      answer: 'Yes, the minimum order amount is RM15 before delivery fees. This ensures efficient delivery service and helps us maintain quality standards.',
      category: 'Services'
    },
    {
      id: 11,
      question: 'Do you offer promotions or discounts?',
      answer: 'Yes! Check our home page for ongoing promotions, seasonal offers, and discount codes. Follow us on social media for exclusive deals and first-time user discounts.',
      category: 'Services'
    },
    {
      id: 12,
      question: 'What if my order is incorrect or damaged?',
      answer: 'Contact our customer service immediately through the app. We\'ll resolve the issue by either sending a replacement or issuing a refund. Please take photos of the issue for faster resolution.',
      category: 'Services'
    }
  ];

  const filteredFAQs = faqData
    .filter(faq => faq.category === selectedCategory)
    .filter(faq => 
      searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
          <Text style={styles.title}>Help & FAQs</Text>
          <Text style={styles.subtitle}>How Can We Help You?</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        <Pressable 
          style={[styles.tabButton, styles.tabButtonActive]}
          onPress={() => {}}
        >
          <Text style={[styles.tabText, styles.tabTextActive]}>FAQ</Text>
        </Pressable>
        <Pressable 
          style={styles.tabButton}
          onPress={() => router.replace('./contact-us')}
        >
          <Text style={styles.tabText}>Contact Us</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Category Filters */}
        <View style={styles.categoryContainer}>
          {(['General', 'Account', 'Services'] as CategoryType[]).map((category) => (
            <Pressable
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive
                ]}
              >
                {category}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* FAQ List */}
        <View style={styles.faqContainer}>
          {filteredFAQs.map((faq, index) => (
            <View key={faq.id} style={styles.faqWrapper}>
              <Pressable
                style={[
                  styles.faqButton,
                  index === 0 && expandedId !== faq.id && styles.faqButtonFirst,
                  expandedId === faq.id && styles.faqButtonExpanded
                ]}
                onPress={() => toggleExpand(faq.id)}
              >
                <Text
                  style={[
                    styles.faqQuestion,
                    expandedId === faq.id && styles.faqQuestionExpanded
                  ]}
                >
                  {faq.question}
                </Text>
                <Text style={styles.chevron}>
                  {expandedId === faq.id ? '▲' : '▼'}
                </Text>
              </Pressable>

              {expandedId === faq.id && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}

          {filteredFAQs.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No FAQs found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search or category filter</Text>
            </View>
          )}
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
        <Pressable style={styles.navItem}>
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
    backgroundColor: '#F3FFCF',
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
    backgroundColor: '#F3FFCF',
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
    borderRadius: 20,
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
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  categoryChipActive: {
    backgroundColor: '#1A5D1A',
    borderColor: '#1A5D1A',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A5D1A',
  },
  categoryTextActive: {
    color: '#fff',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    position: 'absolute',
    right: 28,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    backgroundColor: '#1A5D1A',
    borderRadius: 20,
    alignSelf: 'center',
  },
  searchIconText: {
    fontSize: 18,
  },
  faqContainer: {
    paddingHorizontal: 16,
  },
  faqWrapper: {
    marginBottom: 12,
  },
  faqButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  faqButtonFirst: {
    backgroundColor: '#FFF5F5',
  },
  faqButtonExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: '#F9F9F9',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A5D1A',
    flex: 1,
    paddingRight: 12,
  },
  faqQuestionExpanded: {
    color: '#333',
  },
  chevron: {
    fontSize: 12,
    color: '#FF6347',
    fontWeight: '700',
  },
  faqAnswer: {
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#E0E0E0',
    marginTop: -1,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#BBB',
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
