//////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine       
// Auteur: Iohann Paquette                       
// Date: 2024-05-07                                               
//////////////////////////////////////////////////

//////////////////////////////////////////////////
// Bibliothèques                                                     
//////////////////////////////////////////////////
import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Image } from 'react-native';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getAuth } from 'firebase/auth';

//////////////////////////////////////////////////
// Composants                                                        
//////////////////////////////////////////////////
import FormButton from '../../components/FormButton';
import FormInput from '../../components/FormInput';
import Popup from '../../components/Popup';

//////////////////////////////////////////////////
// App                                                                    
//////////////////////////////////////////////////
export default function Signup() {
    //constants
    const [courriel, setCourriel] = useState("");
    const [mdp, setMdp] = useState("");
    const [confirm, setConfirm] = useState("");
    const [firstname, setFirstName] = useState("");
    const [lastname, setLastName] = useState("");
    const [phone, setPhone] = useState("");

    const [textModal, setTextModal] = useState("");
    const [modalVisible, setModalVisible] = useState(false);

    const auth = getAuth();

    const create_account = () => {
        // mot de passe non similaire
        if (!courriel || !mdp || !confirm || !lastname || !phone) {
            setTextModal("Assurez-vous d'avoir complété tous les champs du formulaire");
            setModalVisible(true);
        } else if (confirm != mdp) {
            setTextModal("Vos deux mots de passe sont différents");
            setModalVisible(true);
        } else {
            createUserWithEmailAndPassword(auth, courriel, mdp)
                .then((userCredential) => {
                    // Signed in 
                    const user = userCredential.user;
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;

                    setTextModal(errorMessage);
                    setModalVisible(true);
                });
        }
    }
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Créer un compte
            </Text>
            <FormInput
                label={'Courriel'}
                placeholder={'name@muniles.ca'}
                useState={setCourriel}
                valueUseState={courriel}
                inputMode='email'
            />
            <FormInput
                label={'Prénom'}
                placeholder={'Prénom..'}
                useState={setFirstName}
                valueUseState={firstname}
            />
            <FormInput
                label={'Nom'}
                placeholder={'Nom de famille..'}
                useState={setLastName}
                valueUseState={lastname}
            />
            <FormInput
                label={'Téléphone'}
                placeholder={'(123) 456-7890'}
                useState={setPhone}
                valueUseState={phone}
                inputMode='tel'
            />
            <FormInput
                label={'Mot de passe'}
                placeholder={'###'}
                useState={setMdp}
                valueUseState={mdp}
                secureTextEntry={true}
            />
            <FormInput
                label={'Confirmer le mot de passe'}
                placeholder={'###'}
                useState={setConfirm}
                valueUseState={confirm}
                secureTextEntry={true}
            />
                        <FormButton onPress={create_account} buttonTitle={"S'inscrire"} />

            <Popup text={textModal} setModalVisible={setModalVisible} modalVisible={modalVisible} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    link: {
        backgroundColor: '#3498db',
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
        width: '100%',
        alignItems: 'center',
    },
    linkText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});