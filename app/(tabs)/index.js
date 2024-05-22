////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import { useState, useContext, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Image } from 'react-native';
import { sendEmailVerification, signInWithEmailAndPassword  } from "firebase/auth";
import { getAuth } from 'firebase/auth';
import { useNavigation } from 'expo-router';

////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////

import FormButton from '@/components/FormButton';
import FormInput from '@/components/FormInput';
import { UserContext,auth} from './_layout';
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

        signInWithEmailAndPassword(auth, courriel, mdp)
            .then((userCredential) => {
                //si le courriel n'a pas été validé
                if (!auth.currentUser.emailVerified) {
                    setTextModal('La confirmation par courriel doit être validée')
                    setModalVisible(true)

                    //renvoyer le courriel de confirmation
                    // sendEmailVerification(auth)
                    // .catch((err)=>console.log(err))
                }
                else {
                    // Signed in 
                    const user = userCredential.user;
                    setConnection(true)
                    navigation.navigate('accueil')

                    //update the email.verified
                    updateDoc(doc(db, 'Users', user.uid), {
                        emailVerified: true
                    })
                        .then(() => console.log('email verified updated'))
                        .catch((err) => console.log(err))
                }

            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                setTextModal(errorMessage)
                setModalVisible(true)
            });
    }

    useEffect(()=>{
        if(auth.currentUser)
            navigation.navigate('accueil')
    },[auth])

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
            />

            {/* submit button */}
            <FormButton onPress={connect} buttonTitle={'Connexion'} />

            {/* mot de passe oublié */}
            <FormButton onPress={()=>navigation.navigate("resetPassword")} buttonTitle={'Mot de passe oublié'} />

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