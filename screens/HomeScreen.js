////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { auth } from '../firebase/fire';
import FormButton from '../components/FormButton';
import axios from 'axios';

import Header from '../components/header';

const HomeScreen = ({ navigation }) => {
    const user = auth.currentUser

    const loginToEnteliweb = async () => {
        try {

            const enteliwebURL = 'http://10.1.1.15/enteliweb'
            const username = 'Jmleblanc'
            const password = 'IDLM2023!'

            const response = await axios.post(enteliwebURL, {
                username: username,
                password: password
            });

            // Check if the login was successful
            if (response.status === 200) {
                // Log in successful, do something (e.g., store token, navigate to another screen)
                console.log('Login successful');
            } else {
                // Login failed, handle error
                console.error('Login failed');
            }
        } catch (error) {
            console.error('Error logging in:', error);
        }
    };

    useEffect(()=>{
        loginToEnteliweb()
    },[])

    return (
        <View style={styles.container}>
            {/* Informations utilisateur */}
            <Header navigation={navigation} nomPage={'HomeScreen'}/>

          
        </View>
    );
}

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 10,
        borderRadius: 60
    }
});
