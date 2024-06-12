////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

////////////////////////////////////////////////
// Bibliothèques
////////////////////////////////////////////////
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Image,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import {
    getAuth,
    reauthenticateWithCredential,
    EmailAuthProvider,
    signOut,
    verifyBeforeUpdateEmail,
    updateProfile,
    deleteUser
}
    from 'firebase/auth';
import { useNavigation } from 'expo-router';
import { deleteDoc, doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore';
import React, { useContext, useEffect, useState, useRef } from 'react';
import {useLocalSearchParams,router} from "expo-router";
////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////
import { UserContext, firebaseConfig } from './_layout';
import FormButton from '@/components/FormButton';
import FormInput from '@/components/FormInput';
import Popup from '@/components/Popup';
import Loading from '@/components/loadingComponent'
import {Feather} from "@expo/vector-icons";
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
    const [password, setPassword] = useState("")
    const [points,setPoints] = useState(0)
    const [phone,setPhone] = useState("")

    const no_profile_pic_url = 'https://firebasestorage.googleapis.com/v0/b/mobilemuniles.appspot.com/o/Images%2Fno_profile_pic.jfif?alt=media&token=31e6531d-110d-4ae0-aa80-d1ea8fc2c47a'
    const [photoUrl,setPhotoUrl] = useState(no_profile_pic_url)
    const urlParams = useLocalSearchParams();

    const [initialEmail, setInitialEmail] = useState("");
    const [initialDisplayName, setInitialDisplayName] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("")
    const [showDelete, setShowDelete] = useState(false)

    const [loading,setLoading] = useState(false);

    //popup
    const [textModal, setTextModal] = useState("");
    const [modalVisible, setModalVisible] = useState(false);

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
                    setInitialDisplayName(data.displayName)

                    setEmail(data.email)
                    setInitialEmail(data.email)

                    setPhone(data.phoneNumber)

                    setPhotoUrl(data.photoURL);

                    setPoints(data.points)
                })
        }
    }

    const changeDisplayName = () => {
        updateProfile(auth.currentUser, {
            displayName: displayName
        })
            .then(() => {
                //update the db
                updateDoc(doc(db, 'Users', auth.currentUser.uid), {
                    displayName: displayName
                })
                    .then(() => {
                        console.log('DB updated')
                        setDisplayName(displayName)
                        setInitialDisplayName(displayName)

                        setTextModal('Votre nom a été modifié avec succés !')
                        setModalVisible(true)
                    })
            })
            .catch((err) => console.log(err))
    }

    const reconnexion = async () => {
        const credential = EmailAuthProvider.credential(auth.currentUser.email, confirmPassword);

        await reauthenticateWithCredential(auth.currentUser, credential)
            .then((res) => console.log('reauth success'))
            .catch((err) => console.log(err))

    }

    const changeEmail = async () => {

        try {
            reconnexion()

            await verifyBeforeUpdateEmail(auth.currentUser, email)
                .then(() => console.log('email sented'))

            setTextModal('Un email de vérification a été envoyé à votre nouvelle adresse.');
            setModalVisible(true);

            console.log(email)
            console.log(auth.currentUser.uid)

            //changer dans la base de données
            updateDoc(doc(db, 'Users', auth.currentUser.uid), {
                email: email
            })
                .then(() => {
                    console.log('DB updated')
                    setInitialEmail(email)
                    setEmail(email)
                })
                .catch((err) => console.log('error lors de la modif dans la BD', err))

        } catch (err) {
            console.log(err);

            if (err.code === 'auth/user-token-expired') {
                setTextModal('Votre session a expiré. Veuillez vous reconnecter pour continuer.')
                setModalVisible(true)

                Deconnexion();

            } else {
                setTextModal('Échec de la modification du courriel. Veuillez réessayer.');
                setModalVisible(true);
            }
        }
    }

    const DeleteAccount = async () => {

        try {
            setLoading(true);

            setShowDelete(false)

            reconnexion()

            //supprimer l'utilisateur
            await deleteDoc(doc(db, 'Users', auth.currentUser.uid))
                .then(() => console.log('compte supprime de la bd'))
                .catch((err) => console.log(err))

            //supprimer la formation de l'utilisateur
            await deleteDoc(doc(db, 'Formation', auth.currentUser.uid))
                .then(() => console.log('formation supprime de la bd'))
                .catch((err) => console.log(err))

            await deleteUser(auth.currentUser)
                .then(() => console.log("Compte detruit"))
                .catch((err) => console.log(err))

            Deconnexion()
            setLoading(false);

            navigation.navigate('index')


        }
        catch (err) {
            console.log(err)
        }
    }

    const resetUser = () => {
        setDisplayName("")
        setEmail("")
        setPhone("")
    }

    const refresh = ()=>{
        setLoading(true);
        loadUser();
        setLoading(false)
    }

    useEffect(() => {
        if (!auth.currentUser)
            navigation.navigate('index')
        else
            refresh()
    }, [auth.currentUser])

    if(loading)
        return <Loading />

    return (
        <ScrollView
            refreshControl={
                <RefreshControl refreshing={loading} onRefresh={refresh} />
            }
            contentContainerStyle={styles.container}
        >
            <Text style={styles.label}>Profil</Text>
            {/* si l'utilisateur est connecte */}
            {auth.currentUser && (
                <View>
                    {/* Info */}
                    <View style={{flexDirection:'row',flex:2,alignItems:'center'}}>

                        {/* Photo de profil */}
                        <View style={{margin:10}}>
                            <TouchableOpacity onPress={()=>{
                                navigation.navigate('selectPhotos');
                                router.setParams({urlParams:photoUrl})
                            }}>
                                <Image
                                    resizeMode={'contains'}
                                    source={{uri:photoUrl}}
                                    style={{height:150,width:150,borderColor:'gray',borderWidth:1}}
                                    loadingIndicatorSource={no_profile_pic_url}
                                />
                            </TouchableOpacity>
                        </View>

                        <View>
                            <Text>{displayName}</Text>
                            <Text style={{fontWeight:'bold',color:'green'}}>{points} pts</Text>
                        </View>

                    </View>

                    {/* display Name */}
                    <View>

                        <Text style={styles.label}>Modifications du profil</Text>
                        <FormInput
                            valueUseState={displayName}
                            useState={setDisplayName}
                            label={'Prénom et nom'}
                            placeholder={'nom...'}
                        />

                        {(initialDisplayName !== displayName) && (
                            <View style={{ margin: 10 }}>
                                <FormButton
                                    backgroundColor='#5B9943'
                                    buttonTitle={'Changer votre nom'}
                                    onPress={changeDisplayName}
                                />
                            </View>
                        )}
                    </View>

                    {/* email */}
                    <View>
                        <FormInput
                            valueUseState={email}
                            useState={setEmail}
                            label={'Courriel'}
                            placeholder={'courriel@email...'}
                            inputMode='email'

                        />

                        {initialEmail !== email && (
                            <View style={{ margin: 10 }}>
                                <FormInput
                                    secureTextEntry
                                    placeholder={'###'}
                                    label={'Mot de passe pour changer le courriel'}
                                    useState={setPassword}
                                    valueUseState={password}

                                />
                                <FormButton
                                    buttonTitle={'Changer le courriel'}
                                    onPress={changeEmail}
                                    backgroundColor='#5B9943'

                                />
                            </View>
                        )}
                    </View>

                        <View style={styles.field}>
                           <View style={{flex:2,flexDirection:'row',alignItems:'center'}}>
                               <Text style={styles.label}>Numéro de téléphone: {phone}</Text>

                               <Feather
                                   style={{margin:20}}
                                   size={'25'}
                                   name={'settings'}
                                   onPress={()=>navigation.navigate('changeTelephone')}
                               />
                           </View>
                        </View>

                </View>
            )}

            <FormButton
                buttonTitle={'Changer le mot de passe'}
                onPress={() => navigation.navigate('resetPassword')}
            />

            <FormButton
                buttonTitle={'Deconnexion'}
                backgroundColor='red'
                color='white'
                onPress={Deconnexion}
            />

            {!showDelete && (
                <FormButton
                    buttonTitle={'Supprimer mon compte'}
                    backgroundColor='red'
                    color='white'
                    onPress={() => setShowDelete(true)}
                />
            )}

            {showDelete && (
                <View style={{ margin: 10 }}>
                    <FormInput
                        secureTextEntry
                        placeholder={'###'}
                        label={'Mot de passe pour supprimer le compte'}
                        useState={setConfirmPassword}
                        valueUseState={confirmPassword}

                    />
                    <FormButton
                        buttonTitle={'Supprimer le compte'}
                        onPress={DeleteAccount}
                        backgroundColor='#5B9943'

                    />
                </View>

            )}

            <Popup text={textModal} setModalVisible={setModalVisible} modalVisible={modalVisible} />

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#f0f4f8',
    },
    field: {
        marginBottom: 20,
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
        marginTop:20,
        fontSize: 18,
        color: '#333',
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#fff',
        color: '#333',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        width: '100%',
        height: 40,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        borderRadius: 60,
        height: 100,
        width: 100,
        borderColor: 'gray',
        borderWidth: 1,
        marginRight: 15,
    },
    profileDetails: {
        flex: 1,
    },
    profileName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#333',
    },
    profilePoints: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'green',
    },
    buttonContainer: {
        marginVertical: 10,
    },
    modalText: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
    },
});

export default Profil;
