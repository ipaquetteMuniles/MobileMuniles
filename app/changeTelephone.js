////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07
////////////////////////////////////////////////

////////////////////////////////////////////////
// Bibliothèques
////////////////////////////////////////////////
import React, { useState, useEffect, useRef } from 'react';
import { View, KeyboardAvoidingView, TextInput, StyleSheet, Text, Platform, TouchableWithoutFeedback,Keyboard } from 'react-native';
import PhoneInput from 'react-native-phone-input';
import { getAuth, updatePhoneNumber, PhoneAuthProvider } from 'firebase/auth';
import { doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import {useNavigation} from "expo-router";

////////////////////////////////////////////////
// Composants
////////////////////////////////////////////////
import FormButton from '../components/FormButton';
import Popup from '../components/Popup';
import {firebaseConfig} from './(tabs)/_layout'
////////////////////////////////////////////////
// App
////////////////////////////////////////////////
const ChangeTelephone = () => {
    // phone parameters
    const [phone, setPhone] = useState("");
    const [code, setCode] = useState('');
    const [verificationId, setVerificationId] = useState(null);

    const recaptchaVerifier = useRef(null);

    const db = getFirestore();
    const navigation = useNavigation();

    //popup
    const auth = getAuth()

    const [textModal, setTextModal] = useState("");
    const [modalVisible, setModalVisible] = useState(false);

    const changePhone = async () => {
        try {
            const phoneProvider = new PhoneAuthProvider(auth);
            const verificationId = await phoneProvider.verifyPhoneNumber(phone,recaptchaVerifier.current);

            setVerificationId(verificationId);
            setTextModal('Un code de vérification a été envoyé à votre numéro de téléphone.');
            setModalVisible(true);

        } catch (err) {
            console.log(err);
            setTextModal('Échec de l\'envoi du code de vérification. Veuillez réessayer.');
            setModalVisible(true);
        }
    };

    const confirmCode = async () => {
        try {
            const credential = PhoneAuthProvider.credential(verificationId, code);
            await updatePhoneNumber(auth.currentUser, credential);
            await updateDoc(doc(db, 'Users', auth.currentUser.uid), {
                phoneNumber: phone
            });
            setTextModal('Votre numéro de téléphone a été modifié avec succès !');
            setModalVisible(true);
            navigation.navigate('profil')
        } catch (err) {
            console.log(err);

            if(err.code == 'auth/invalid-verification-code'){
                setTextModal('Mauvais code. Veuillez réessayer.');
                setModalVisible(true);
            }
            else {
                setTextModal('Échec de la vérification du code. Veuillez réessayer.');
                setModalVisible(true);
            }

        }
    };

    const getPhone = async () => {
        if (auth.currentUser) {
            const tableName = 'Users';
            await getDoc(doc(db, tableName, auth.currentUser.uid))
                .then((res) => {
                    const data = res.data();
                    setPhone(data.phoneNumber);
                });
        }
    };

    useEffect(() => {
        getPhone();
    }, []);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.inner}>
                    <Text style={styles.header}>Modifier le téléphone</Text>
                    <Text>{phone}</Text>

                    <FirebaseRecaptchaVerifierModal
                        ref={recaptchaVerifier}
                        firebaseConfig={firebaseConfig}
                    />

                    {/* input */}
                    {!verificationId && (
                        <PhoneInput
                            style={styles.phoneInput}
                            initialValue={phone}
                            placeholder={'+1 (123)-456-7890'}
                            autoFormat={true}
                            confirmText={'Done'}
                            initialCountry='ca'
                            onChangePhoneNumber={setPhone}
                            onPressConfirm={changePhone}
                        />
                    )}

                    {verificationId && (
                        <View style={styles.confirmationContainer}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Code de vérification"
                                value={code}
                                onChangeText={setCode}
                                keyboardType="numeric"
                            />
                            <FormButton
                                buttonTitle="Confirmer le code"
                                onPress={confirmCode}
                                backgroundColor="#4CAF50"
                            />
                        </View>
                    )}

                    {!verificationId && (
                        <FormButton
                            buttonTitle="Envoyer le code de vérification"
                            onPress={changePhone}
                            backgroundColor="#2196F3"
                        />
                    )}
                </View>
            </TouchableWithoutFeedback>

            <Popup text={textModal} setModalVisible={setModalVisible} modalVisible={modalVisible} />

        </KeyboardAvoidingView>
    );
}

export default ChangeTelephone;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    inner: {
        padding: 24,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        fontSize: 32,
        marginBottom: 16,
        color: '#333',
        fontWeight: 'bold',
    },
    subHeader: {
        fontSize: 18,
        marginBottom: 12,
        color: '#666',
    },
    phoneInput: {
        margin: 10,
        width: '90%',
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderColor: '#ccc',
        borderWidth: 1,
    },
    confirmationContainer: {
        width: '100%',
        alignItems: 'center',
    },
    textInput: {
        height: 40,
        borderColor: '#ccc',
        borderBottomWidth: 1,
        marginBottom: 16,
        width: '80%',
        textAlign: 'center',
    },
    btnContainer: {
        marginTop: 12,
    },
});
