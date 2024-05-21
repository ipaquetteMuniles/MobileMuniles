////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import { Tabs } from 'expo-router';
import React, { useEffect, useState, useContext, createContext } from 'react';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useNavigation } from 'expo-router';

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
////////////////////////////////////////////////

export const firebaseConfig = {
  apiKey: "AIzaSyDi7BZBmGCLP9NxLr7cbeTFarjyHWElUXY",
  authDomain: "mobilemuniles.firebaseapp.com",
  projectId: "mobilemuniles",
  storageBucket: "mobilemuniles.appspot.com",
  messagingSenderId: "999169612850",
  appId: "1:999169612850:web:aac70d2035e6f8f9cbb02b",
  measurementId: "G-BDHMS9PHZ6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const UserContext = createContext();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isconnected, setConnection] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    onAuthStateChanged(auth, (utilisateur) => {
      if (utilisateur) {

        if (utilisateur.emailVerified) {
          setConnection(true);
          navigation.navigate("accueil")
        }


      }
    });
  }, [auth])

  return (
    <UserContext.Provider value={{ isconnected, setConnection }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
        }}>

        <Tabs.Screen
          name="index"
          options={{
            title: 'Connexion',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
            ),
            href: !isconnected ? '' : null

          }}
        />
        <Tabs.Screen
          name="signup"
          options={{
            title: 'signup',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'person' : 'person-sharp'} color={color} />
            ),
            href: !isconnected ? '/signup' : null

          }}
        />
        {/* UTILISATEUR CONNECTÉ */}
        <Tabs.Screen
          name="accueil"
          options={{
            title: 'Accueil',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
            ),
            href: isconnected ? '/accueil' : null
          }}
        />

        
        <Tabs.Screen
          name="map"
          options={{
            title: 'Carte',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'map' : 'map-outline'} color={color} />
            ),
            href: isconnected ? '/map' : null
          }}
        />

        <Tabs.Screen
          name="profil"
          options={{
            title: 'Profil',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'person-circle-sharp' : 'person-circle-outline'} color={color} />
            ),
            href: isconnected ? '/profil' : null
          }}
        />

      </Tabs>
    </UserContext.Provider >
  );
}