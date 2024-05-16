////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signOut } from 'firebase/auth';

////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////
import { useContext, useEffect } from 'react';
import { UserContext } from './_layout';
import FormButton from '@/components/FormButton';
////////////////////////////////////////////////
// App
////////////////////////////////////////////////
const Profil = () => {
    const auth = getAuth()
    const navigation = useNavigation();
    const { setConnection } = useContext(UserContext);

    const Deconnexion = () => {
        signOut(auth)
            .then(() => {
                setConnection(false)
                navigation.navigate("index")
            })
            .catch((err) => {
                console.log(err)
            })
    }

    useEffect(() => {
        console.log(auth.currentUser)
    }, [])

    return (
        <View style={styles.container}>
            <FormButton
                buttonTitle={'Deconnexion'}
                backgroundColor='red'
                color='white'
                onPress={Deconnexion}
            />
            <Text>{auth.currentUser.email}</Text>

        </View>
    );
}

export default Profil;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10,
    },
});