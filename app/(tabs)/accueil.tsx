////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Image } from 'react-native';
import { getAuth
    
 } from 'firebase/auth';

export default function Home() {
    const auth = getAuth()
    
    return (
        <View>
            <Text>Home</Text>

            
        </View>
    )
}