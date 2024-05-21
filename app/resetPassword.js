////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from 'expo-router';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useState } from 'react';

////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////
import FormButton from '@/components/FormButton';
import FormInput from '@/components/FormInput';
import Popup from '@/components/Popup';
////////////////////////////////////////////////
// App
////////////////////////////////////////////////
const ResetPassword = () => {
    const navigation = useNavigation();
    const auth = getAuth();
    const user = auth.currentUser;

    const [courriel, setCourriel] = useState("");
    const [status, setStatus] = useState(false);

    const [textModal, setTextModal] = useState("");
    const [modalVisible, setModalVisible] = useState(false);

    const sendEmailReset = () => {

        sendPasswordResetEmail(auth, courriel)
            .then(() => {
                setStatus(true);
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;

                setTextModal(errorCode)
                setModalVisible(true)
            });
    }

    return (
        <View style={styles.container}>
            {/* Avant de peser sur envoyer changement */}
            {!status && (
                <View>
                    <Text style={styles.title}>
                        Réinitialiser le mot de passe
                    </Text>

                    <Text>Entrez le courriel associé à votre compte</Text>

                    {/* courriel */}
                    <FormInput
                        label={'Courriel'}
                        placeholder={'name@muniles.ca'}
                        useState={setCourriel}
                        valueUseState={courriel}
                        inputMode='email'
                    />

                    {/* mot de passe oublié */}
                    <FormButton
                        onPress={sendEmailReset}
                        buttonTitle={'Envoyer changement'}
                    />

                </View>
            )}

            {/* apres que l'utilisateur est envoyer la requete de changement de mot de passe */}
            {status && (
                <View>
                    <Text>
                        Un courriel à été envoyé à {courriel}, afin de changer le mot de passe
                    </Text>

                </View>
            )}

            <FormButton
                onPress={() => {
                    if (auth.currentUser)
                        navigation.navigate("profil")
                    else
                        navigation.navigate("index")
                }}
                buttonTitle={'Retour'}
                backgroundColor={'red'}
            />


            <Popup text={textModal} setModalVisible={setModalVisible} modalVisible={modalVisible} />

        </View>
    );
}

export default ResetPassword;

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