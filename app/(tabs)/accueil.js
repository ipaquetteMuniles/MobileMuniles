////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07
// Accueil
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    FlatList,
    Linking,
    Platform,
    Image,
    ActivityIndicator,
    Dimensions,
    TouchableOpacity,
    RefreshControl, TextInput
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import {doc, getDoc, getFirestore, updateDoc,} from 'firebase/firestore';
import { useLocalSearchParams } from "expo-router";
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

import Constants from 'expo-constants'
import { Pedometer, Accelerometer } from 'expo-sensors';
import WebView from 'react-native-webview';
import {Feather} from "@expo/vector-icons";

////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////

import { liste_url_videos } from '../../BD_VIDEOS';
import FormButton from '@/components/FormButton';
import Slideshow from '@/components/Slideshow';
import Loading from '@/components/loadingComponent';
import FormInput from '@/components/FormInput';
import Popup from "@/components/Popup";
import AstuceInputFlatlist from "@/components/astuceInputFlatlist";

////////////////////////////////////////////////
//App
////////////////////////////////////////////////
export default function Home() {
    const auth = getAuth();
    const navigation = useNavigation();
    const db = getFirestore();

    const [userInfo, setUserInfo] = useState();
    const [formationEffectue, setFormationDone] = useState(false);

    const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking');
    const [pastStepCount, setPastStepCount] = useState(0);
    const [currentStepCount, setCurrentStepCount] = useState(0);
    const [stepsInDb,setStepsInDb] = useState(0)
    const [distanceWalked,setDistanceWalked] = useState(0)

    const [nbKiloGesSauve, setKiloGes] = useState(0)
    const NB_PAS = 4200

    const [yearSelection, setYearSelection] = useState(2100)

    //vélo
    const G = 9.81;
    const CYCLING_THRESHOLD = 0.5;
    const STEP_DURATION = 0.1;
    const [bycicleDistance, setBicycleDistance] = useState(0)
    const [bycicleDuration, setBicycleDuration] = useState()
    const [nbKiloGesSauveBicycle,setKiloGesBicycle] = useState(0)

    const map_url_ocean_level = `https://coastal.climatecentral.org/embed/map/10/-61.5882/47.3635/?theme=sea_level_rise&map_type=year&basemap=roadmap&contiguous=true&elevation_model=best_available&forecast_year=${yearSelection}&pathway=ssp3rcp70&percentile=p50&return_level=return_level_1&rl_model=gtsr&slr_model=ipcc_2021_med`
    const map_erosion_uqar = `https://sigec.uqar.ca/portal/carto/view?mapId=3d421e35-1941-4940-aa94-9b4645cbb691`
    const [url, setUrl] = useState(map_url_ocean_level)

    const [loading, setLoading] = useState(false)
    //Popup
    const [textModal, setTextModal] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    ////////////////////////////////////////////////
    //Pédomètre
    ////////////////////////////////////////////////

    const subscribeToPedometer = async () => {

        const isAvailable = await Pedometer.requestPermissionsAsync();
        setIsPedometerAvailable(String(isAvailable.status));

        if (isAvailable) {
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - 1);

            const pastStepCountResult = await Pedometer.getStepCountAsync(start, end);
            if (pastStepCountResult) {
                setPastStepCount(pastStepCountResult.steps);
                if(pastStepCountResult.steps >= NB_PAS){
                    givePoints()
                }
            }
        }
        else
            console.log('Pedometer is not available')
    };

    const changePermissionPedometer = async() =>{

        const status = await Pedometer.getPermissionsAsync();

        if(status.status === 'granted')
        {
            setIsPedometerAvailable('denied')
        }
        else{
            subscribeToPedometer()
            setIsPedometerAvailable('granted')
        }
    }

    const calculReductionGesMarche = () => {
        Pedometer.watchStepCount(result => {
            setCurrentStepCount(result.steps);
        });
        /*
        Selon l'Agence de protection de l'environnement des États-Unis (EPA),
        la combustion d'un gallon d'essence produit environ 8,89 kg de dioxyde
        de carbone (CO2). En supposant qu'une voiture moyenne consomme environ 9,4 litres d'essence
        pour parcourir 100 km, cela équivaut à environ 2,35 kg de CO2 par litre d'essence.

        Si l'on considère qu'une personne marche à environ 5 km/h,
        elle peut parcourir 5 km en une heure. Si une voiture consomme environ 9,4
        litres pour parcourir 100 km, elle consommerait environ 0,47 litre pour parcourir 5 km.
        Cela équivaut à environ 1,11 kg de CO2 évité pour chaque 5 km parcourus à pied plutôt qu'en voiture.
         */
        let nbPas = currentStepCount;
        let newPastStepCount = pastStepCount + nbPas;

        //ajouter le nombre de pas des entrainments dans les derniers 24h
        newPastStepCount += stepsInDb;
        setPastStepCount(newPastStepCount);

        let nbKilometres = newPastStepCount / 500; // if each step is 0.5 m
        setKiloGes((nbKilometres * 0.222).toFixed(2)); // assuming 5 km saves 1.11 kg of CO2
    }

    const calculReductionGesBike = (dist)=>{
        // Facteur d'émission de CO2 en kg/km pour une voiture
        const co2PerKm = 0.2;
        if(dist > 0)
            return (dist * co2PerKm).toFixed(3);
        else
            return 0
    }

    ////////////////////////////////////////////////
    //Base de données
    ////////////////////////////////////////////////
    const getWalkData = async () =>{
        const tableNames = ['Efforts_Walk','Efforts_Run']
        let totalSteps = 0;
        let totalDistances = 0;

        tableNames.forEach(async(table)=>
        {
            const docRef = await getDoc(doc(db,table,auth.currentUser.uid))

            if(docRef.exists())
            {
                let array = docRef.data().efforts
                array.map((effort)=>
                {
                    if(new Date().getTime() - effort.endTime.toDate().getTime() < (24 * 60 * 60 * 1000))
                    {
                        totalDistances += effort.distance;
                        totalSteps += effort.totalSteps;
                    }

                })
            }
        })

        setStepsInDb(totalSteps)
        setDistanceWalked(totalDistances)
    }

    const getBicycleData = async() =>{
        const tableName = 'Efforts_Bike';
        await getDoc(doc(db,tableName,auth.currentUser.uid))
            .then((res)=>{
                if(res.exists())
                {
                    const data = res.data();
                    const efforts = data.efforts

                    //Distance parcouru
                    let TotalDistanceIn24 = 0;
                    //total temps efforts
                    let totalTempsEfforts = 0;

                    efforts.map((item,index)=>{
                        let s = item.startTime.toDate()
                        let e = item.endTime.toDate()
                        if(new Date().getTime() - e.getTime() < (24 * 60 * 60 * 1000))
                        {
                            //cumule distance
                            TotalDistanceIn24 = (TotalDistanceIn24 + item.distance) ;
                            TotalDistanceIn24 = Number(TotalDistanceIn24).toFixed(3);

                            //cumule de temps d'effort
                            totalTempsEfforts += (e.getTime() -s.getTime())
                        }
                    })

                    // Conversion du temps total en millisecondes en minutes
                    let totalMinutesEfforts = Math.floor(totalTempsEfforts / (1000 * 60));
                    let totalHoursEfforts = Math.floor(totalMinutesEfforts / 60);
                    let remainingMinutes = (totalMinutesEfforts % 60).toString().padStart(2, '0');

                    setBicycleDistance(TotalDistanceIn24)
                    conosole.log(totalHoursEfforts,remainingMinutes)
                    setBicycleDuration(`${totalHoursEfforts}h:${remainingMinutes}min`)

                    let reduction = calculReductionGesBike(TotalDistanceIn24);
                    setKiloGesBicycle(reduction)
                }
            })
            .catch((err)=>console.log(err))
    }

    const getUserInfo = async () => {
        try {
            const docSnap = await getDoc(doc(db, 'Users', auth.currentUser.uid));
            if (docSnap.exists()) {
                setUserInfo(docSnap.data());
                if (docSnap.data().FormationEffectue) {
                    setFormationDone(true);
                }
            }
        } catch (err) {
            console.log(err);
        }
    };

    const givePoints = async() =>{
        await updateDoc(doc(db,'Users',auth.currentUser.uid),{
            points:userInfo.points + 100
        })
            .then(()=>console.log('pts updated'))
            .catch((err)=>console.log(err))
    }

    ////////////////////////////////////////////////
    //Notifications
    ////////////////////////////////////////////////

    const registerForPushNotificationsAsync = async () => {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                alert('Failed to get push token for push notification!');
                return;
            }
            try {
                const projectId =
                    Constants?.expoConfig?.extra?.eas?.projectId ??
                    Constants?.easConfig?.projectId;
                if (!projectId) {
                    throw new Error('Project ID not found');
                }
                token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
                // console.log(token);
            } catch (e) {
                token = `${e}`;
            }
        } else {
            alert('Must use physical device for Push Notifications');
        }

    }

    const refresh = () => {
        setLoading(true)
        setUrl(map_url_ocean_level)

        getUserInfo();

        getBicycleData()
        getWalkData()

        subscribeToPedometer();
        calculReductionGesMarche()

        registerForPushNotificationsAsync();

        setLoading(false)
    }

    //watch pages modifications
    useEffect(() => {
        if (!auth.currentUser) {
            navigation.navigate('index');
        } else
            refresh()

    }, [auth, formationEffectue,url]);


    //watch current steps
    useEffect(() => {
        calculReductionGesMarche()
    }, [currentStepCount])

    if (loading)
        return <Loading />

    return (
        <ScrollView
            refreshControl={
                <RefreshControl refreshing={loading} onRefresh={refresh} />
            }
                contentContainerStyle={styles.container}>
            {!formationEffectue && (
                <View style={{alignItems:'center',borderColor:'gray',borderWidth:1,borderRadius:30,justifyContent:'center'}}>
                    <Text style={styles.text}>
                        Les questions suivantes nous permettrons de construire un suivi et
                        de vous permettre de réduire votre emprunte environnementale
                    </Text>

                    <FormButton
                        buttonTitle="Commencer ma formation éco-énergétique"
                        onPress={() => navigation.navigate('formation')}
                    />
                </View>
            )}
                    <View>
                        <View>
                            <Text style={styles.title}>Ce que vous avez sauvé dans les derniers 24H</Text>
                            {/* Pedometre */}
                            {isPedometerAvailable === 'granted' && (
                                <View style={{ flexDirection: 'row', flex: 3, alignItems: 'center', margin: 10 }}>
                                    <Image
                                        style={{ padding: 10, borderRadius: 60 }}
                                        width={100}
                                        height={100}
                                        resizeMode='contain'
                                        source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/mobilemuniles.appspot.com/o/Images%2Fcoureurse.gif?alt=media&token=bc1b55b4-9fb4-48ea-a337-a540e43ba8b1' }}
                                    />
                                    <View style={{ alignItems: 'center', justifyContent: 'center',width:'50%' }}>
                                        <Text style={styles.text}>Pas dans les derniers 24h :
                                            <Text style={{ fontWeight: 'bold' }}>{pastStepCount}</Text>
                                        </Text>

                                        <Text style={styles.text}>Distance marché ou couru dans les derniers 24h :
                                            <Text style={{ fontWeight: 'bold' }}>{distanceWalked} km</Text>
                                        </Text>

                                        <Text style={{ color: 'green', fontWeight: 10 }}>Pas actuel: + {currentStepCount}</Text>
                                        <Text style={styles.text}>
                                            <Text style={{ fontWeight: 'bold' }}>{nbKiloGesSauve} </Text>
                                            kg de CO2 sauvé</Text>
                                    </View>

                                    {/*Arreter d'écouter le pédomètre*/}
                                    <View>
                                        <Feather
                                            name={'bell'}
                                            size={30}
                                            onPress={()=>changePermissionPedometer()}
                                        />
                                    </View>
                                </View>
                            )}

                            {isPedometerAvailable !== 'granted' && (
                               <FormButton
                                   onPress={changePermissionPedometer}
                                   buttonTitle={'Activer le pédomètre'}

                                   />
                            )}

                            {/* Vélo */}
                            <View style={{ flexDirection: 'row', flex: 3, alignItems: 'center', margin: 10 }}>
                                <Image
                                    style={{ padding: 10, borderRadius: 60 }}
                                    width={100}
                                    height={100}
                                    resizeMode='contain'
                                    source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/mobilemuniles.appspot.com/o/Images%2Fvelo.gif?alt=media&token=3d9223e1-1228-4be1-a276-00e6c88f641e' }}
                                />
                                <View style={{ alignItems: 'center', justifyContent: 'center',width:'50%' }}>
                                    <Text style={styles.text}>Nombre de kilomètres parcourus en vélo dans les derniers 24h:
                                        <Text style={{ fontWeight: 'bold' }}>{bycicleDistance} km</Text>
                                    </Text>

                                    <Text style={styles.text}>Temps de l'effort: {bycicleDuration}</Text>
                                    <Text style={styles.text}>
                                        <Text style={{ fontWeight: 'bold' }}>{nbKiloGesSauveBicycle} </Text>
                                        kg de CO2 sauvé
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <Text style={styles.title}>Conseil et astuces</Text>

                        {/* Diaporama d'images */}
                        <View>
                            <Slideshow />
                        </View>

                        {/* Astuces de la société */}
                        <AstuceInputFlatlist nbItemToRender={3} fromPage={'accueil'} navigation={navigation}/>

                        <View>
                            <View style={styles.section}>
                                <Text style={styles.undertitle}>Compostage</Text>
                                <Text style={styles.text}>
                                    Mettez du papier et du carton dans votre bac brun. Cela empêche le gel des matières en hiver et enlève les odeurs en été.
                                </Text>
                                <Text style={styles.text}>
                                    Mettez vos matières en vrac dans votre bac. Sinon, favorisez les sacs en papier ou les sacs certifiés compostables.
                                </Text>
                                <Text style={styles.text}>
                                    Saviez-vous qu’avec l’ensemble des matières compostables collectées sur le territoire, la Municipalité fait un compost de très bonne qualité? Vous pouvez vous en procurer au CGMR au coût de 5 $ pour l’équivalent d’un bac brun (240 litres ou 3 paniers à poissons) ou 25 $ la tonne (une boîte de camion). N’oubliez pas d’apporter vos contenants! Rappelez-vous que la qualité de ce produit découle directement de vos efforts à bien faire le tri à la source des matières résiduelles.
                                </Text>
                            </View>
                            <View style={styles.section}>
                                <Text style={styles.undertitle}>Recyclage</Text>
                                <Text style={styles.text}>
                                    N’oubliez pas de rincer vos contenants afin de faciliter la récupération des matières. Les contenants non lavés souillent le reste des matières.
                                </Text>
                                <Text style={styles.text}>
                                    Réunissez toutes les pellicules plastiques dans un sac transparent noué, vous éviterez qu’elles s’envolent et atterrissent dans notre environnement.
                                </Text>
                                <Text style={styles.text}>
                                    Les sacs biodégradables ne sont ni recyclables, ni compostables et vont au bac noir.
                                </Text>
                                <Text style={styles.text}>
                                    Les matières recyclables doivent être déposées en vrac dans votre bac vert (sans sac).
                                </Text>
                                <Text style={styles.text}>
                                    Les bouteilles et les canettes consignées peuvent être rapportées au magasin ou donner à des organismes.
                                </Text>
                            </View>
                            <View style={styles.section}>
                                <Text style={styles.undertitle}>Déchets</Text>
                                <Text style={styles.text}>
                                    Ne mettez jamais de produits dangereux dans votre bac noir,
                                    <Text style={styles.link} onPress={() => Linking.openURL('https://www.muniles.ca/services-aux-citoyens/matieres-residuelles/ecocentre-et-points-de-depots/')}>
                                        ils doivent être disposés correctement aux endroits appropriés.
                                    </Text>
                                </Text>
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.title}>Comment économiser de l'eau</Text>
                                <Text style={styles.undertitle}>L’eau en quelques chiffres</Text>

                                    <Text style={styles.text}>Tirer la chasse d’eau : 20 litres</Text>
                                    <Text style={styles.text}>Prendre une douche : 20 litres à la minute</Text>
                                    <Text style={styles.text}>Avec une pompe à débit réduit : 14 litres à la minute</Text>
                                    <Text style={styles.text}>Prendre un bain : 170 litres</Text>
                                    <Text style={styles.text}>Lave-vaisselle : 40 litres</Text>
                                    <Text style={styles.text}>Laveuse : 80 litres</Text>
                                    <Text style={styles.text}>Brossage de dents en laissant couler l’eau : 7,5 litres</Text>
                                    <Text style={styles.text}>Laver sa voiture : 400 litres</Text>
                                    <Text style={styles.text}>Remplir une piscine : 48 000 litres</Text>

                                <Text style={styles.undertitle}>
                                    Comment faire des économies?
                                </Text>
                                <TouchableOpacity onPress={()=>Linking.openURL('https://www.muniles.ca/wp-content/uploads/2021/10/economie_eau.jpeg')}>
                                    <Image
                                        source={{uri:'https://www.muniles.ca/wp-content/uploads/2021/10/economie_eau.jpeg'}}
                                        style={{ padding: 10, margin:10 }}
                                        width={Dimensions.get('window').width}
                                        height={Dimensions.get('window').height / 2}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Carte */}
                        <View>
                            <Text style={styles.title}>Simulations</Text>
                            <FormInput
                                label={'Simulation en année'}
                                useState={setYearSelection}
                                valueUseState={yearSelection}
                                placeholder={'Année'}
                                onSubmitEditing={refresh}
                                inputMode='numeric'
                            />
                            <WebView
                                source={{ uri: url }}
                                style={styles.webview}
                                allowsFullscreenVideo={false}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                                startInLoadingState={true}
                                renderLoading={() => <Loading />}
                            />
                        </View>

                        {/* Vidéos */}
                        <View style={styles.section}>
                            <Text style={styles.title}>Liste de vidéos intéressantes</Text>
                            {/* <Text style={styles.title}>Vidéo écolo-éducatives</Text> */}
                            {liste_url_videos.map((item, index) => (
                                <View id={index}>
                                    <Text style={styles.undertitle}>{item.title}</Text>
                                    <WebView
                                        style={styles.webview}
                                        source={{ uri: item.url }}
                                        javaScriptEnabled={true}
                                        domStorageEnabled={true}
                                    />
                                </View>
                            ))}
                        </View>
                    </View>

            <Popup text={textModal} setModalVisible={setModalVisible} modalVisible={modalVisible} />

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        backgroundColor: '#f9f9f9',
        marginTop: 40,
    },
    centeredView: {
        alignItems: 'center',
    },
    introText: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
        color: '#333',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
        color: '#333',
    },
    section: {
        marginBottom: 20,
    },
    undertitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    text: {
        fontSize: 16,
        marginBottom: 10,
        color: '#555',
        padding: 5
    },
    link: {
        color: 'blue',
    },
    flatList: {
        margin: 20,
    },
    webview: {
        width: '100%',
        height: 450,
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
});
