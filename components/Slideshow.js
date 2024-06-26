////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Linking
} from 'react-native';
import { useAssets } from 'expo-asset';
import {slides} from '../slides'
const { width } = Dimensions.get('window');

////////////////////////////////////////////////
//App
////////////////////////////////////////////////
const Slideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const [images, imagesError] = useAssets(slides); // Load images
  const isLoaded = !imagesError && images && images.length > 0; // Check if images are loaded

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === slides.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: -width * currentIndex,
      useNativeDriver: true,
    }).start();
  }, [currentIndex, translateX]);

  if (!isLoaded) {
    // Display loading indicator or handle error
    return (
      <View style={styles.container}>
        <ActivityIndicator animating={true} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.slider, { transform: [{ translateX }] }]}>
        {images.map((image, index) => (
          <TouchableOpacity onPress={()=>Linking.openURL(image.uri)} id={index}>
            <Image key={index} source={image} style={styles.image} resizeMode='contain'/>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slider: {
    flexDirection: 'row',
    width: width * slides.length,
  },
  image: {
    width: width,
    height: Dimensions.get('screen').height / 2,
  },
});

export default Slideshow;
