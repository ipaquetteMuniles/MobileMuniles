//////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useEffect, useState, useContext } from 'react';
import { useNavigation } from 'expo-router';
import { sendEmailVerification, getAuth, signOut } from 'firebase/auth';
////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////
import FormButton from '@/components/FormButton';
import Popup from '@/components/Popup';
import { UserContext } from './(tabs)/_layout';

////////////////////////////////////////////////
// App
////////////////////////////////////////////////
const EmailVerification = () => {
    const navigation = useNavigation();
    const auth = getAuth();
    const user = auth.currentUser;

    const [courriel, setCourriel] = useState(user.email);
    const [status, setStatus] = useState(false);

    const [textModal, setTextModal] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    // const { setConnection } = useContext(UserContext);

    const ReSendEmail = () => {
        sendEmailVerification(user)
            .then(() => {
                setTextModal(`Le courriel vient d'être réenvoyé à l'adresse suivante : ${courriel}`)
                setModalVisible(true);
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;

                setTextModal(errorMessage);
                setModalVisible(true);
            });
    };

    const Retour = async () => {
        signOut(auth)
            .then(() => {
                setConnection(false)
                navigation.navigate('index');
            })
            .catch((err) => console.log(err));
    };

    useEffect(() => {
        const interval = setInterval(() => {
            user.reload().then(() => {
                if (user.emailVerified) {
                    setStatus(true);
                    navigation.navigate('accueil');
                    clearInterval(interval);
                }
            }).catch((error) => {
                console.log(error);
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [user, navigation]);

    return (
        <View style={styles.container}>
            {/* Si le courriel n'est pas confirmé */}
            {!status && (
                <View>
                    <Text style={styles.title}>
                        Confirmez votre compte par le courriel envoyé à {courriel}
                    </Text>

                    <Text style={{ alignContent: 'center' }}>Vérifiez vos courriels indésirables</Text>

                    <ActivityIndicator animating={true} size={'large'} />

                    {/* mot de passe oublié */}
                    <FormButton
                        onPress={ReSendEmail}
                        buttonTitle={'Renvoyer le courriel'}
                    />

                    {/* retour et déconnexion */}
                    <FormButton
                        onPress={Retour}
                        buttonTitle={'Déconnexion'}
                        backgroundColor='red'
                    />
                </View>
            )}

            <Popup text={textModal} setModalVisible={setModalVisible} modalVisible={modalVisible} />
        </View>
    );
}

export default EmailVerification;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        backgroundColor: '#f9f9f9',
        marginTop: 40,
        alignItems: 'center'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
        color: '#333',
    }
});
