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
import Loading from '@/components/loadingComponent';
////////////////////////////////////////////////
//App
////////////////////////////////////////////////

export default function Signup() {
    
    //form
    const [courriel, setCourriel] = useState('');
    const [mdp, setMdp] = useState('');
    const [confirm, setConfirm] = useState('');
    const [Name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const no_profile_pic_url = 'https://firebasestorage.googleapis.com/v0/b/mobilemuniles.appspot.com/o/Images%2Fno_profile_pic.jfif?alt=media&token=31e6531d-110d-4ae0-aa80-d1ea8fc2c47a'

    //Popup
    const [textModal, setTextModal] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    const [loading,setLoading] = useState(false);

    //firebase
    const auth = getAuth();
    const db = getFirestore();
    const { setConnection } = useContext(UserContext);

    //navigation
    const navigation = useNavigation();

    const createAccount = () => {
        if (!courriel || !mdp || !confirm || !phone) {
            setTextModal('Assurez-vous d\'avoir complété tous les champs du formulaire');
            setModalVisible(true);
        } else if (confirm !== mdp) {
            setTextModal('Vos deux mots de passe sont différents');
            setModalVisible(true);
        } else {
            createUserWithEmailAndPassword(auth, courriel, mdp)
                .then(async(userCredential) => {
                    setLoading(true);

                    // Signed in
                    const user = userCredential.user;
                    //update db
                    await updateDBUser(user)

                    //login the user
                    signInWithEmailAndPassword(auth,courriel,mdp)
                        .then(()=>{
                            console.log('login sucessful')
                            setConnection(true)
                            navigation.navigate("emailVerification")
                        })
                        .catch((err)=>console.log(err))

                    //sending confirmation email
                    sendEmailVerification(user)
                    .then(()=>console.log('Email sented !'))
                    .catch((err)=>console.log('Error while sending the confirmation email'))

                    resetField()

                    setLoading(false);
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
        setName("")
        setPhone("")
    }

    const updateDBUser = async(user)=>{
        await setDoc(doc(db,"Users",user.uid),{
            uid : user.uid,
            email:user.email,
            emailVerified:false,
            displayName: Name,
            phoneNumber:phone,
            photoURL:no_profile_pic_url,
            points:0,
            FormationEffectue:false
        })
        .then(()=> console.log('DB updated'))
        .catch((err)=> console.log(err))
    }

    if(loading)
        return <Loading />

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
                label="Prénom et nom"
                placeholder="Prénom.."
                useState={setName}
                valueUseState={Name}
            />

            <View style={styles.field}>
                <Text style={styles.label}>Numéro de téléphone</Text>

                <PhoneInput
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
                onSubmitEditing={createAccount}
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
        marginTop:40,
        marginBottom:40
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center', 
        color: '#333', 
    },
    field: {
        margin: 20,
        padding: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    label: {
        fontSize: 18,
        color: '#333',
        marginBottom: 8,
        fontWeight: '600',
    }
});
