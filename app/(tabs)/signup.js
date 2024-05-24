//////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur: Iohann Paquette
// Date: 2024-05-07
//////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////

import React, { useState,useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import PhoneInput from 'react-native-phone-input'
////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////
import FormButton from '../../components/FormButton';
import FormInput from '../../components/FormInput';
import Popup from '../../components/Popup';
import { UserContext } from './_layout';
////////////////////////////////////////////////
//App
////////////////////////////////////////////////

export default function Signup() {
    
    //form
    const [courriel, setCourriel] = useState('');
    const [mdp, setMdp] = useState('');
    const [confirm, setConfirm] = useState('');
    const [firstname, setFirstName] = useState('');
    const [lastname, setLastName] = useState('');
    const [phone, setPhone] = useState('');

    //Popup
    const [textModal, setTextModal] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    //firebase
    const auth = getAuth();
    const db = getFirestore();
    const { setConnection } = useContext(UserContext);

    //navigation
    const navigation = useNavigation();

    const createAccount = () => {
        if (!courriel || !mdp || !confirm || !lastname || !phone) {
            setTextModal('Assurez-vous d\'avoir complété tous les champs du formulaire');
            setModalVisible(true);
        } else if (confirm !== mdp) {
            setTextModal('Vos deux mots de passe sont différents');
            setModalVisible(true);
        } else {
            createUserWithEmailAndPassword(auth, courriel, mdp)
                .then((userCredential) => {
                    // Signed in
                    const user = userCredential.user;
                    //update db
                    updateDBUser(user)

                    resetField()
                    
                    //sending confirmation email
                    sendEmailVerification(user)
                    .then(()=>console.log('Email sented !'))
                    .catch((err)=>console.log('Error while sending the confirmation email'))

                    //login the user
                    signInWithEmailAndPassword(auth,courriel,mdp)
                    .then(()=>{
                        console.log('login sucessful')
                        setConnection(true)
                        navigation.navigate('accueil',{reload:true})
                    })
                    .catch((err)=>console.log(err))
                })
                .catch((error) => {
                    const errorMessage = error.message;
                    setTextModal(errorMessage);
                    setModalVisible(true);
                });
        }
    };

    const resetField = () =>{
        setCourriel("")
        setMdp("")
        setConfirm("")
        setLastName("")
        setFirstName("")
        setPhone("")
    }

    const updateDBUser = async(user)=>{
        await setDoc(doc(db,"Users",user.uid),{
            uid : user.uid,
            email:user.email,
            emailVerified:false,
            displayName: firstname +' '+ lastname,
            phoneNumber:phone,
            photoURL:user.photoURL,
            points:0,
            FormationEffectue:false
        })
        .then(()=> console.log('DB updated'))
        .catch((err)=> console.log(err))
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Créer un compte</Text>
            <FormInput
                label="Courriel"
                placeholder="name@muniles.ca"
                useState={setCourriel}
                valueUseState={courriel}
                inputMode="email"
            />
            <FormInput
                label="Prénom"
                placeholder="Prénom.."
                useState={setFirstName}
                valueUseState={firstname}
            />
            <FormInput
                label="Nom"
                placeholder="Nom de famille.."
                useState={setLastName}
                valueUseState={lastname}
            />

            <View style={styles.field}>
                <Text style={styles.label}>Numéro de téléphone</Text>

                <PhoneInput
                        style={{
                            margin: 10,
                            width: '90%'
                        }}

                        placeholder={'Phone number'}
                        autoFormat={true}
                        confirmText={'Done'}
                        confirmTextStyle={{ color: 'white', backgroundColor: 'blue', padding: 5 }}
                        countriesList={require('../../countries.json')}
                        initialCountry='ca'
                        value={phone}
                        onChangePhoneNumber={setPhone}
                    />
            </View>
           
            <FormInput
                label="Mot de passe"
                placeholder="###"
                useState={setMdp}
                valueUseState={mdp}
                secureTextEntry
            />
            <FormInput
                label="Confirmer le mot de passe"
                placeholder="###"
                useState={setConfirm}
                valueUseState={confirm}
                secureTextEntry
            />
            <FormButton buttonTitle="Créer un compte" onPress={createAccount} />
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center', 
        color: '#333', 
    },
    field: {
        marginBottom: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    label: {
        fontSize: 20,
        color: '#060270',
        marginBottom: 10,
        fontWeight: 'bold',
    }
});
