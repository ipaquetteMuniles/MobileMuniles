////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Image } from 'react-native';
import { browserSessionPersistence,setPersistence , signInWithEmailAndPassword } from "firebase/auth";
import { useNavigation } from 'expo-router';
/*import {
    statusCodes,
    isErrorWithCode,
    GoogleSignin,
    GoogleSigninButton
} from "@react-native-google-signin/google-signin";*/
////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////

import FormButton from '@/components/FormButton';
import FormInput from '@/components/FormInput';
import { UserContext, auth } from './_layout';
import Popup from '@/components/Popup';
import { getFirestore, updateDoc, doc } from 'firebase/firestore';

////////////////////////////////////////////////
// App
////////////////////////////////////////////////

export default function LoginScreen() {
    const db = getFirestore()

    //formulaire
    const [courriel, setCourriel] = useState("");
    const [mdp, setMdp] = useState("");

    //popup
    const [textModal, setTextModal] = useState("");
    const [modalVisible, setModalVisible] = useState(false);

    const { setConnection } = useContext(UserContext);
    const navigation = useNavigation();

    const connect = () => {
        // setPersistence(auth, browserSessionPersistence)
        // .then(() => {
        //     return signInWithEmailAndPassword(auth, courriel, mdp);
        // })
        signInWithEmailAndPassword(auth, courriel, mdp)
        .then((userCredential) => {
            const user = userCredential.user;
            setConnection(true);
            navigation.navigate('accueil');

            // Update the email verification status
            return updateDoc(doc(db, 'Users', user.uid), {
                emailVerified: true,
            });
        })
        .then(() => {
            console.log('Email verification status updated');
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            if(errorCode === 'auth/invalid-credential')
                setTextModal(`Entrées invalides, courriel ou mot de passe invalide. Veuillez réessayer`)
            else if(errorCode === 'auth/invalid-email')
                setTextModal('Email invalide, veuillez corriger')
            else
                setTextModal(`Erreur lors de la connexion veuillez réessayer.`)
            setModalVisible(true);
            console.log(`Error [${errorCode}]: ${errorMessage}`);
        });
       
    }

 /*   const signinWithGoogle = async () =>{
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            //setState({ userInfo });
            console.log(userInfo)
        } catch (error) {
            if (isErrorWithCode(error)) {
                switch (error.code) {
                    case statusCodes.NO_SAVED_CREDENTIAL_FOUND:
                        // Android and Apple only. No saved credential found, try calling `createAccount`
                        break;
                    case statusCodes.SIGN_IN_CANCELLED:
                        // sign in was cancelled
                        break;
                    case statusCodes.ONE_TAP_START_FAILED:
                        // Android and Web only, you probably have hit rate limiting.
                        // On Android, you can still call `presentExplicitSignIn` in this case.
                        // On the web, user needs to click the `WebGoogleSigninButton` to sign in.
                        break;
                    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                        // Android-only: play services not available or outdated
                        // Web: when calling an unimplemented api (requestAuthorization)
                        break;
                    default:
                    // something else happened
                }
            } else {
                // an error that's not related to google sign in occurred
            }
        }
    }*/

    useEffect(() => {
        if (auth.currentUser)
            navigation.navigate('accueil')
    }, [auth])

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>
                Connexion
            </Text>


            {/* courriel */}
            <FormInput
                label={'Courriel'}
                placeholder={'name@muniles.ca'}
                useState={setCourriel}
                valueUseState={courriel}
                inputMode='email'
            />

            {/* field 2 - MDP */}
            <FormInput
                label={'Mot de passe'}
                placeholder={'###'}
                useState={setMdp}
                valueUseState={mdp}
                secureTextEntry={true}
                onSubmitEditing={connect}
            />

            {/* submit button */}
            <FormButton onPress={connect} buttonTitle={'Connexion'} />

            {/*Se connecter par google*/}
            {/*  <GoogleSigninButton
                onPress={signinWithGoogle}
            />
            */}

            {/* mot de passe oublié */}
            <FormButton onPress={() => navigation.navigate("resetPassword")} buttonTitle={'Mot de passe oublié'} />

            <Popup text={textModal} setModalVisible={setModalVisible} modalVisible={modalVisible} />

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
        marginTop: 40,
    },
    field: {
        flex: 2,
        flexDirection: 'column',
        margin: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
        color: '#333',
    }
});