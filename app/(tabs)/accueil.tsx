////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Image } from 'react-native';
import { getAuth
    
 } from 'firebase/auth';
import { useNavigation } from 'expo-router';

export default function Home() {
    const auth = getAuth()
    const navigation = useNavigation();

    useEffect(()=>{
        //si l'utilisateur essaie de se déplacer vers cette page
        //alors qu'il n'y ait pas autorisé
        if(!auth.currentUser)
            navigation.navigate('index')
    },[])
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Home</Text>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center', 
        color: '#333', 
    }
});