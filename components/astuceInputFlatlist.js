////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur : Iohann Paquette
// Date : 2024-05-07
////////////////////////////////////////////////

////////////////////////////////////////////////
// Bibliothèques
////////////////////////////////////////////////
import { StyleSheet, Text, View, FlatList, TextInput, Image, Animated } from 'react-native';
import {addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, setDoc, updateDoc} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { Feather } from "@expo/vector-icons";
import { Swipeable,RectButton,GestureHandlerRootView } from 'react-native-gesture-handler';

////////////////////////////////////////////////
// Composants
////////////////////////////////////////////////
import FormButton from "../components/FormButton";
import LoadingComponent from "../components/loadingComponent";
import Popup from "@/components/Popup";
////////////////////////////////////////////////
// App
////////////////////////////////////////////////
const AstuceInputFlatlist = ({ navigation, nbItemToRender, fromPage }) => {
    const [populationAstuces, setPopulationAstuces] = useState([]);
    const [textAstuce, setTextAstuce] = useState("");
    const [wantToEdit, setWantToEdit] = useState(false);
    const [editDocId, setEditDocId] = useState(null);
    const [loading, setLoading] = useState(true);

    //Popup
    const [textModal, setTextModal] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    const auth = getAuth();
    const db = getFirestore();

    ////////////////////////////////////////////////
    // Fonctions
    ////////////////////////////////////////////////
    const getUserInfoByUid = async (uid) => {
        try {
            let data;
            const docSnap = await getDoc(doc(db, 'Users', uid));
            if (docSnap.exists()) {
                data = docSnap.data();
                return data;
            } else {
                return null;
            }
        } catch (err) {
            console.log(err);
        }
    };

    const getAstucesPopulation = async () => {
        const tableName = 'AstucesPopulation';
        let array = [];

        try {
            const res = await getDocs(collection(db, tableName));
            const promises = res.docs.map(async (astuce) => {
                let userInfo = await getUserInfoByUid(astuce.data().uid);
                return {
                    item: astuce.data(),
                    user: userInfo,
                };
            });

            array = await Promise.all(promises);

            array.sort((a, b) => b.item.date.toDate() - a.item.date.toDate());
        } catch (err) {
            console.log(err);
        }

        setPopulationAstuces(array);
    };

    const addAstuce = async () => {
        const tableName = 'AstucesPopulation';

        if (!textAstuce) {
            setTextModal('Veuillez ajouter plus de texte pour votre astuce !');
            setModalVisible(true);
            return;
        } else {
            const data = {
                uid: auth.currentUser.uid,
                date: new Date(),
                text: textAstuce,
            };

            await addDoc(collection(db, tableName), data)
                .then(async (res) => {
                    console.log('astuce ajoute');
                    setTextAstuce("");

                    await updateDoc(doc(db, tableName, res.id), {
                        docId: res.id
                    })
                        .catch((err) => console.log(err))

                    getAstucesPopulation()
                })
                .catch((err) => {
                    console.log(err);
                    setTextModal("Erreur lors de l'ajout de l'astuce, réessayer plus tard ...");
                    setModalVisible(true);
                })
        }
    };

    const editAstuce = async (item) => {
        const tableName = 'AstucesPopulation';

        if (!textAstuce) {
            setTextModal('Veuillez ajouter plus de texte pour modifier votre astuce !');
            setModalVisible(true);
            return;
        } else {
            const data = {
                uid: auth.currentUser.uid,
                date: new Date(),
                text: textAstuce,
            };

            await updateDoc(doc(db, tableName, item.item.docId), data)
                .then(() => {
                    setTextModal('Astuce modifiée !')
                    setModalVisible(true)

                    setWantToEdit(false)
                    setEditDocId(null)
                    setTextAstuce("");

                    getAstucesPopulation()
                })
                .catch((err) => {
                    console.log(err);
                    setTextModal("Erreur lors de la modification de l'astuce, réessayer plus tard ...");
                    setModalVisible(true);
                })
        }
    }

    const supprimerAstuces = async (id) => {
        const tableName = 'AstucesPopulation';
        console.log(id)
        await deleteDoc(doc(db, tableName, id))
            .then(() => {
                setTextModal('Élément supprimé !')
                setModalVisible(true)

                getAstucesPopulation()
            })
    }

    useEffect(() => {
        setLoading(true);
        getAstucesPopulation();
        setLoading(false);
    }, []);

    const renderRightActions = (progress, dragX, docId) => {
        const trans = dragX.interpolate({
            inputRange: [0, 50, 100, 101],
            outputRange: [-20, 0, 0, 1],
        });
        return (
            <RectButton style={styles.RightActions} onPress={() => supprimerAstuces(docId)}>
                <Animated.Text
                    style={[
                        styles.actionText,
                        {
                            transform: [{translateX: trans}],
                        },
                    ]}>
                    <Feather name={'trash'} color={'white'} size={30}/>
                </Animated.Text>
            </RectButton>
        );
    };

    const renderLeftActions = (progress, dragX, item) => {
        const trans = dragX.interpolate({
            inputRange: [-60, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });

        return (
            <RectButton style={styles.LeftActions} onPress={() => {
                setTextAstuce(item.item.text);
                setWantToEdit(true);
                setEditDocId(item.item.docId)
            }}>
                <Animated.Text
                    style={[
                        styles.actionText,
                        {
                            transform: [{translateX: trans}],
                        },
                    ]}>
                    <Feather name={'edit'} color={'white'} size={30}/>
                </Animated.Text>
            </RectButton>
        );
    }

    if (loading) return <LoadingComponent/>;

    const renderItem = ({item, index}) => {
        let d = item.item.date.toDate();
        let newDate;
        let isRecent = (new Date().getTime() - d.getTime()) < (24 * 60 * 60 * 1000);

        if(isRecent){
            const hours = d.getHours();
            const minutes = d.getMinutes().toString().padStart(2, '0');
            newDate = `${hours}:${minutes}`;
        }
        else
            newDate = d.toLocaleDateString()

        const contex = (
            <View style={styles.postContainer}>
                <View style={styles.postHeader}>
                    <Image
                        style={styles.avatar}
                        source={{uri: item.user.photoURL}}
                    />
                    <View style={styles.postUserInfo}>
                        <Text style={styles.postUserName}>{item.user.displayName}</Text>
                        <Text style={styles.postDate}>{newDate}</Text>
                    </View>
                </View>
                <Text style={styles.postText}>{item.item.text}</Text>
            </View>
        );

        if (!wantToEdit && (auth.currentUser.uid == item.user.uid)) {
            return (
                <GestureHandlerRootView>
                    <Swipeable
                        friction={2}
                        renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item.item.docId)}
                        renderLeftActions={(progress, dragX) => renderLeftActions(progress, dragX, item)}
                    >
                        {contex}
                    </Swipeable>
                </GestureHandlerRootView>
            );
        } else if (editDocId === item.item.docId && wantToEdit) {
            return (
                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder='Modifier votre astuce'
                        onChangeText={setTextAstuce}
                        value={textAstuce}
                        placeholderTextColor='#999999'
                        blurOnSubmit
                        inputMode='text'
                        returnKeyType='done'
                        showSoftInputOnFocus={false}
                        style={styles.input}
                    />
                    <View style={{flex: 2, flexDirection: 'row'}}>
                        <FormButton
                            onPress={() => editAstuce(item)}
                            buttonTitle='Modifier'
                            backgroundColor='green'
                        />
                        <FormButton
                            onPress={() => {
                                setWantToEdit(false);
                                setEditDocId(null);
                                setTextAstuce("");
                            }}
                            buttonTitle='Annuler'
                            backgroundColor='red'
                        />
                    </View>
                </View>
            );
        } else {
            return contex;
        }
    };

    return (
        <View style={styles.container}>
            <View style={{flex: 2, flexDirection: 'row'}}>
                <Text style={styles.title}>Astuces écoénergétique de la société</Text>
                {fromPage === 'accueil' && (
                    <Feather
                        name={'arrow-right'}
                        onPress={() => navigation.navigate("forum")}
                        size={30}
                        color={'blue'}
                    />
                )}
            </View>

            {!wantToEdit && (
                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder='Ajouter une astuce écoénergétique..'
                        onChangeText={setTextAstuce}
                        value={textAstuce}
                        placeholderTextColor='#999999'
                        blurOnSubmit
                        inputMode='text'
                        returnKeyType='done'
                        showSoftInputOnFocus={false}
                        style={styles.input}
                    />
                    <FormButton
                        onPress={addAstuce}
                        buttonTitle='Ajouter'
                        backgroundColor='green'
                    />
                </View>
            )}

            <Text style={styles.undertitle}>
                Glisser vers la droite pour
                <Feather name={'trash'} color={'red'} size={20}/>
                et gauche pour <Feather name={'edit'} color={'green'} size={20}/>
                vos astuces
            </Text>

            <FlatList
                maxToRenderPerBatch={nbItemToRender}
                refreshing={loading}
                data={populationAstuces}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
            />
            <Popup text={textModal} setModalVisible={setModalVisible} modalVisible={modalVisible}/>
        </View>
    );
}

export default AstuceInputFlatlist;

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
    },
    inputContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    input: {
        flex: 1,
        borderColor: '#cccccc',
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        marginRight: 10,
    },
    postContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        elevation: 3,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    postUserInfo: {
        flex: 1,
    },
    postUserName: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    postDate: {
        color: '#888',
        fontSize: 14,
    },
    postText: {
        fontSize: 16,
        lineHeight: 22,
    },
    box: {
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        elevation: 3,
    },
    actionText: {
        color:'white',
        fontSize: 16,
        padding: 10,
        alignItems:'center',
        justifyContent:'center'
    },
    RightActions: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        backgroundColor:'red',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        elevation: 3,
    },
    LeftActions: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        backgroundColor:'#619e15',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        elevation: 3,
    },
    undertitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    }
});
