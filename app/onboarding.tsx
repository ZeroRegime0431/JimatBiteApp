import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";


const { width, height } = Dimensions.get("window");

// Exact greens used in the design/screenshot
const BG_GREEN = "#76E064"; // header / background green
const PRIMARY_GREEN = "#1A5D1A"; // title / button green

// SVG imports for main images
import CoffeeSvg from '../assets/Onboarding/images/coffee.svg';
import IceCreamSvg from '../assets/Onboarding/images/icecream.svg';
import PizzaSvg from '../assets/Onboarding/images/pizza.svg';

// SVG imports for icons
import CardSvg from '../assets/Onboarding/icons/Card.svg';
import DeliverSvg from '../assets/Onboarding/icons/Deliver.svg';
import DocumentSvg from '../assets/Onboarding/icons/Document.svg';


// ONBOARDING DATA
const slides = [
  {
    id: "1",
    title: "Order For Food",
    description:
      "Browse through a wide variety of delicious meals from multiple restaurants. Find your favorites and order with just a few taps.",
    image: PizzaSvg,
    icon: DocumentSvg,
  },
  {
    id: "2",
    title: "Easy Payment",
    description:
      "Secure and convenient payment options at your fingertips. Pay with your preferred method and enjoy a seamless checkout experience.",
    image: IceCreamSvg,
    icon: CardSvg,
  },
  {
    id: "3",
    title: "Fast Delivery",
    description:
      "Get your food delivered hot and fresh to your doorstep. Track your order in real-time and enjoy quick, reliable delivery service.",
    image: CoffeeSvg,
    icon: DeliverSvg,
  },
];

export default function Onboarding() {
  const flatListRef = useRef<FlatList<any> | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const handleSkip = () => {
    // Navigate straight to home page when user skips onboarding
    router.push('/home-page');
  };

  const handleViewableItemsChanged = ({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  };

  return (
    <View style={styles.container}>
      {/* SKIP BUTTON */}
      <Pressable style={styles.skipBtn} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip →</Text>
      </Pressable>

      {/* SLIDER */}
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.imageContainer}>
              <item.image width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
            </View>

            {/* Bottom Card */}
            <View style={styles.card}>
              <View style={styles.iconContainer}>
                <item.icon width={60} height={60} />
              </View>

              <Text style={styles.title}>{item.title}</Text>

              <Text style={styles.description}>{item.description}</Text>

              {/* Dots */}
              <View style={styles.dotsRow}>
                {slides.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      { opacity: i === currentIndex ? 1 : 0.3 },
                    ]}
                  />
                ))}
              </View>

              {/* Button */}
              <Pressable
                style={styles.button}
                onPress={
                  currentIndex === slides.length - 1
                    ? () => router.push('/home-page')
                    : handleNext
                }
              >
                <Text style={styles.buttonText}>
                  {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
        onViewableItemsChanged={handleViewableItemsChanged}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_GREEN,
  },

  skipBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },

  skipText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  slide: {
    width,
    alignItems: "center",
  },

  imageContainer: {
    width: width,
    height: height * 0.60,
    overflow: "hidden",
  },

  card: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -50,
    backgroundColor: "white",
    width: width,
    height: height * 0.60,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    alignItems: "center",
    paddingTop: 45,
    paddingBottom: 36,
    overflow: "visible",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },

  icon: {
    width: 60,
    height: 60,
    marginBottom: 15,
  },
  iconContainer: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderWidth: 3,
    borderColor: PRIMARY_GREEN,
    marginTop: -30,
    marginBottom: 12,
    elevation: 6,
    bottom: -8,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: PRIMARY_GREEN,
    marginBottom: 10,
    bottom: -8,
  },

  description: {
    textAlign: "center",
    color: "#555",
    width: "80%",
    lineHeight: 18,
    marginBottom: 20,
    bottom: -12,
  },

  dotsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 40,
  },

  dot: {
    width: 25,
    height: 4,
    backgroundColor: BG_GREEN,
    borderRadius: 10,
    bottom: -12,
  },

  button: {
    backgroundColor: PRIMARY_GREEN,
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 25,
    bottom: 14,
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
