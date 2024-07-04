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
import { signInWithEmailAndPassword } from "firebase/auth";
import {auth} from '../firebase/fire'

////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////

import FormButton from '../components/FormButton';
import FormInput from '../components/FormInput';
import Popup from '../components/Popup';

////////////////////////////////////////////////
// App
////////////////////////////////////////////////

const LoginScreen = ({ navigation, route }) => {
    //usestate
    const [courriel, setCourriel] = useState("");
    const [mdp, setMdp] = useState("");

    //Popup
    const [textModal, setTextModal] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    const connect = () => {
        signInWithEmailAndPassword(auth, courriel, mdp)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(error)
                
                if(errorCode === 'auth/invalid-credential')
                {
                    setTextModal('Entrées invalides, veuillez corriger et réessayer.')
                    setModalVisible(true)
                }
                else
                {
                    setTextModal('Erreur lors de la connexion, veuillez réessayer plus tard.')
                    setModalVisible(true)
                }
            });
    }

    return (
        <View style={styles.container}>
           
            {/* courriel */}
            <View style={styles.formContainer}>
                <FormInput 
                    label={'Courriel'}
                    placeholder={'name@muniles.ca'}
                    useState={setCourriel}
                    valueUseState={courriel}
                    textContentType='emailAddress'
                />

                {/* field 2 - MDP */}
                <FormInput 
                    label={'Mot de passe'}
                    placeholder={'###'}
                    useState={setMdp}
                    valueUseState={mdp}
                    textContentType='password'
                    secureTextEntry={true}
                    multiline={false}
                />
            </View>
            

            {/* submit button */}
            <FormButton onPress={connect} buttonTitle={'Connexion'} />

            <Popup
                text={textModal}
                setModalVisible={setModalVisible}
                modalVisible={modalVisible}
            />
        </View>
    );
}

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10,
        borderRadius: 60
    },
    field: {
        flex: 2,
        flexDirection: 'column',
        margin: 10,
        alignItems:'center',
        justifyContent:'center'
    },
    formContainer: {
        backgroundColor: '#0E1442',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
    }
});
