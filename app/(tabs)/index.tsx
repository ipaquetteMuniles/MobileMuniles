////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, Image } from 'react-native';
import { signInWithEmailAndPassword } from "firebase/auth";
import { getAuth } from 'firebase/auth';
////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////
import FormButton from '@/components/FormButton';
import FormInput from '@/components/FormInput';
import { UserContext } from './_layout';
import Popup from '@/components/Popup';
////////////////////////////////////////////////
// App
////////////////////////////////////////////////

export default function LoginScreen() {
    //usestate
    const [courriel, setCourriel] = useState("");
    const [mdp, setMdp] = useState("");
    const auth = getAuth()
    const [textModal, setTextModal] = useState("");
    const [modalVisible, setModalVisible] = useState(false);

    const { setConnection } = useContext(UserContext);

    const connect = () => {
        signInWithEmailAndPassword(auth, courriel, mdp)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                setConnection(true)
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                setTextModal(errorMessage)
                setModalVisible(true)
            });
    }

    return (
        <View style={styles.container}>
            <View>
                <Text style={{ fontWeight: 'bold', fontSize: 30 }}>
                    Connexion
                </Text>
            </View>

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

            <Popup text={textModal} setModalVisible={setModalVisible} modalVisible={modalVisible} />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10,
    },
    field: {
        flex: 2,
        flexDirection: 'column',
        margin: 10,
        alignItems: 'center',
        justifyContent: 'center'
    }
});