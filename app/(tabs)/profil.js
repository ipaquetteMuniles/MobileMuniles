////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signOut } from 'firebase/auth';

////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////
import { useContext, useEffect, useState } from 'react';
import { UserContext } from './_layout';
import FormButton from '@/components/FormButton';
import FormInput from '@/components/FormInput';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
////////////////////////////////////////////////
// App
////////////////////////////////////////////////
const Profil = () => {
    const auth = getAuth()
    const db = getFirestore()
    const navigation = useNavigation();
    const { setConnection } = useContext(UserContext);

    //useState
    const [displayName, setDisplayName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")

    const Deconnexion = () => {
        signOut(auth)
            .then(() => {
                resetUser()
                setConnection(false)
                navigation.navigate("index")
            })
            .catch((err) => {
                console.log(err)
            })
    }

    const loadUser = async () => {
        const tableName = 'Users';

        if (auth.currentUser) {
            await getDoc(doc(db, tableName, auth.currentUser.uid))
                .then((res) => {
                    const data = res.data()

                    setDisplayName(data.displayName)
                    setEmail(data.email)
                    setPhone(data.phoneNumber)
                })
        }
    }

    const resetUser = () => {
        setDisplayName("")
        setEmail("")
        setPhone("")
    }

    useEffect(() => {
        loadUser()
    }, [auth])

    return (
        <ScrollView contentContainerStyle={styles.container}>

            {/* si l'utilisateur */}
            {auth.currentUser && (
                <View>

                    {/* display Name */}
                    <FormInput
                        valueUseState={displayName}
                        useState={setDisplayName}
                        label={'Prénom et nom'}
                        placeholder={'nom...'}
                    />

                    {/* email */}
                    <FormInput
                        valueUseState={email}
                        useState={setEmail}
                        label={'Courriel'}
                        placeholder={'courriel@email...'}
                        inputMode='email'
                    />

                    {/* phone */}
                    <FormInput
                        valueUseState={phone}
                        useState={setPhone}
                        label={'Téléphone'}
                        placeholder="(123) 456-7890"
                        inputMode="tel"
                    />
                </View>
            )}

            <FormButton
                buttonTitle={'Deconnexion'}
                backgroundColor='red'
                color='white'
                onPress={Deconnexion}
            />

        </ScrollView>
    );
}

export default Profil;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1, // Allow content to scroll
        padding: 16,
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
    }
});