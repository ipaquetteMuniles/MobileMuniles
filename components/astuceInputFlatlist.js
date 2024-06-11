////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur : Iohann Paquette
// Date : 2024-05-07
////////////////////////////////////////////////

////////////////////////////////////////////////
// Bibliothèques
////////////////////////////////////////////////
import { StyleSheet, Text, View, FlatList, TextInput, Image, ActivityIndicator } from 'react-native';
import { addDoc, collection, doc, getDoc, getDocs, getFirestore } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { Feather } from "@expo/vector-icons";
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';

////////////////////////////////////////////////
// Composants
////////////////////////////////////////////////
import FormButton from "../components/FormButton";
import LoadingComponent from "../components/loadingComponent";
////////////////////////////////////////////////
// App
////////////////////////////////////////////////
const AstuceInputFlatlist = ({ navigation, nbItemToRender, fromPage }) => {
    const [populationAstuces, setPopulationAstuces] = useState([]);
    const [textAstuce, setTextAstuce] = useState("");
    const [loading, setLoading] = useState(true);

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
                .then(() => {
                    console.log('astuce ajoute');
                    setTextAstuce("");
                })
                .catch((err) => {
                    console.log(err);
                    setTextModal("Erreur lors de l'ajout de l'astuce, réessayer plus tard ...");
                    setModalVisible(true);
                });
        }
    };

    useEffect(() => {
        setLoading(true);
        getAstucesPopulation();
        setLoading(false);
    }, []);

    const translateX = useSharedValue(0);

    const panGestureEvent = (event) => {
        /*translateX.value = event.translationX;*/
        console.log(event.translationX)
    };

    const panGestureEnd = (event) => {
        if (event.translationX > 100) {
            //runOnJS(handleDelete)(item.id);
            console.log('ici')
        }
        translateX.value = withSpring(0);
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    if (loading) return <LoadingComponent />;
    return (
        <GestureHandlerRootView style={styles.container}>
            <View style={{ margin: 20 }}>
                <View style={{ flex: 2, flexDirection: 'row' }}>
                    <Text style={styles.title}>Astuces écoénergétique de la société</Text>
                    {/* Ouvrir en plus grand */}
                    {fromPage === 'accueil' && (
                        <Feather
                            name={'arrow-right'}
                            onPress={() => navigation.navigate("forum")}
                            size={30}
                            color={'blue'}
                        />
                    )}
                </View>

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

                <FlatList
                    maxToRenderPerBatch={nbItemToRender}
                    refreshing={loading}
                    data={populationAstuces}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item,index }) =>
                        {
                            const itemTranslateX = {};

                            if (!itemTranslateX[index]) {
                                itemTranslateX[index] = 0;
                            }

                            return(
                                <PanGestureHandler onGestureEvent={()=>panGestureEvent(index)} onEnded={panGestureEnd}>
                                    <Animated.View style={[styles.box, animatedStyle]}>
                                        <View style={styles.postContainer}>
                                            <View style={styles.postHeader}>
                                                <Image
                                                    style={styles.avatar}
                                                    source={{ uri: item.user.photoURL }}
                                                />
                                                <View style={styles.postUserInfo}>
                                                    <Text style={styles.postUserName}>{item.user.displayName}</Text>
                                                    <Text style={styles.postDate}>{new Date(item.item.date.toDate()).toLocaleDateString()}</Text>
                                                </View>
                                            </View>
                                            <Text style={styles.postText}>{item.item.text}</Text>
                                        </View>
                                    </Animated.View>
                                </PanGestureHandler>
                            )
                        }

                    }
                />
            </View>
        </GestureHandlerRootView>
    );
};

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
});
