////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import {StyleSheet, Text, View, ScrollView, TouchableOpacity,Image} from 'react-native';
import {
    getAuth,
    reauthenticateWithCredential,
    EmailAuthProvider,
    signOut,
    updateEmail,
    verifyBeforeUpdateEmail,
    updateProfile,
    updatePhoneNumber,
    PhoneAuthProvider,
    deleteUser
}
    from 'firebase/auth';
import { useNavigation } from 'expo-router';
import { deleteDoc, doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore';
import { useContext, useEffect, useState, useRef } from 'react';
import PhoneInput from 'react-native-phone-input'
import {useLocalSearchParams,router} from "expo-router";
////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////
import { UserContext, firebaseConfig } from './_layout';
import FormButton from '@/components/FormButton';
import FormInput from '@/components/FormInput';
import Popup from '@/components/Popup';
import Loading from '@/components/loadingComponent'
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
    const no_profile_pic_url = 'https://firebasestorage.googleapis.com/v0/b/mobilemuniles.appspot.com/o/Images%2Fno_profile_pic.jfif?alt=media&token=31e6531d-110d-4ae0-aa80-d1ea8fc2c47a'
    const [photoUrl,setPhotoUrl] = useState(no_profile_pic_url)
    const urlParams = useLocalSearchParams();

    //phone parameters
    const [phone, setPhone] = useState("")
    const [confirm, setConfirm] = useState(null);
    const [code, setCode] = useState('');
    const [verificationId, setVerificationId] = useState(null);
    const recaptchaVerifier = useRef(null);

    const [initialEmail, setInitialEmail] = useState("");
    const [initialDisplayName, setInitialDisplayName] = useState("");
    const [initialPhone, setInitialPhone] = useState("");

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
                    setInitialPhone(data.phoneNumber)

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

    const changePhone = async () => {
        try {
            const phoneProvider = new PhoneAuthProvider(auth);
            const verificationId = await phoneProvider.verifyPhoneNumber(phone, recaptchaVerifier.current);
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
            setInitialPhone(phone);
            setTextModal('Votre numéro de téléphone a été modifié avec succès !');
            setModalVisible(true);
        } catch (err) {
            console.log(err);
            setTextModal('Échec de la vérification du code. Veuillez réessayer.');
            setModalVisible(true);
        }
    };

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

    useEffect(() => {
        if (!auth.currentUser)
            navigation.navigate('index')
        else
        {
            setLoading(true);
            loadUser();
            setLoading(false)
        }
    }, [auth.currentUser])

    if(loading)
        return <Loading />

    return (
        <ScrollView contentContainerStyle={styles.container}>
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
                                    source={{uri:photoUrl ? photoUrl : no_profile_pic_url}}
                                    style={{borderRadius:60,height:100,width:100,borderColor:'gray',borderWidth:1}}
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

                    <View>
                        <View style={styles.field}>
                            <Text style={styles.label}>Numéro de téléphone: {phone}</Text>

                            {/* <PhoneInput
                                style={{
                                    margin: 10,
                                    width: '90%',
                                    padding: 10
                                }}
                                initialValue={phone}
                                placeholder={'+1 (123)-456-7890'}
                                autoFormat={true}
                                confirmText={'Done'}
                                countriesList={require('../../countries.json')}
                                initialCountry='ca'
                                onChangePhoneNumber={setPhone}
                            /> */}
                        </View>
                        {/* {initialPhone !== phone && (
                            <View style={{ margin: 10 }}>
                                <FormButton
                                    buttonTitle={'Changer le téléphone'}
                                    onPress={changePhone}
                                    backgroundColor='#5B9943'
                                />
                                {verificationId && (
                                    <View>
                                        <FormInput
                                            valueUseState={code}
                                            useState={setCode}
                                            label={'Code de vérification'}
                                            placeholder={'123456'}
                                            inputMode="numeric"
                                        />
                                        <FormButton
                                            buttonTitle={'Vérifier le code'}
                                            onPress={confirmCode}
                                            backgroundColor='#5B9943'
                                        />
                                    </View>
                                )}
                            </View>
                        )} */}
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

export default Profil;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1, // Allow content to scroll
        padding: 16,
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
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