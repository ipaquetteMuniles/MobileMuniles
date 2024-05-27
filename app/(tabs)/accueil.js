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
import { StyleSheet, Text, View, ScrollView, FlatList, Linking, Platform, Image, ActivityIndicator } from 'react-native';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { useLocalSearchParams } from "expo-router";
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { Pedometer } from 'expo-sensors';
import WebView from 'react-native-webview';
////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////

import { liste_url_videos } from '../../BD_VIDEOS';
import FormButton from '@/components/FormButton';
import Slideshow from '@/components/Slideshow';
import Loading from '@/components/loadingComponent';
import FormInput from '@/components/FormInput';


////////////////////////////////////////////////
//App
////////////////////////////////////////////////
export default function Home() {
    const auth = getAuth();
    const navigation = useNavigation();
    const db = getFirestore();

    const [userInfo, setUserInfo] = useState();
    const [formationEffectue, setFormationDone] = useState(false);
    const { done } = useLocalSearchParams();

    const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking');
    const [pastStepCount, setPastStepCount] = useState(0);
    const [nbKiloGesSauve, setKiloGes] = useState(0)

    const [yearSelection, setYearSelection] = useState(2100)

    const map_url_ocean_level = `https://coastal.climatecentral.org/embed/map/10/-61.5882/47.3635/?theme=sea_level_rise&map_type=year&basemap=roadmap&contiguous=true&elevation_model=best_available&forecast_year=${yearSelection}&pathway=ssp3rcp70&percentile=p50&return_level=return_level_1&rl_model=gtsr&slr_model=ipcc_2021_med`
    const map_erosion_uqar = `https://sigec.uqar.ca/portal/carto/view?mapId=3d421e35-1941-4940-aa94-9b4645cbb691`
    const [url, setUrl] = useState(map_url_ocean_level)

    const [loading, setLoading] = useState(false)

    const subscribeToPedometer = async () => {
        const isAvailable = await Pedometer.isAvailableAsync();
        setIsPedometerAvailable(String(isAvailable));

        if (isAvailable) {
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - 1);

            const pastStepCountResult = await Pedometer.getStepCountAsync(start, end);
            if (pastStepCountResult) {
                setPastStepCount(pastStepCountResult.steps);
            }
        }
    };

    const calculReductionGesMarche = () => {
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

        let nbPas = pastStepCount;
        let nbKilometres = nbPas / 1000; // si chaque pas est 1 m
        setKiloGes(Math.round(nbKilometres * 0.222)) // en se disant que 5 km économise 1,11 Kg
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
                console.log(token);
            } catch (e) {
                token = `${e}`;
            }
        } else {
            alert('Must use physical device for Push Notifications');
        }

        return token;
    }

    useEffect(() => {
        if (!auth.currentUser) {
            navigation.navigate('index');
        } else {
            setLoading(true)
            
            calculReductionGesMarche()
            getUserInfo();
            registerForPushNotificationsAsync();
            subscribeToPedometer();

            setLoading(false)
        }
    }, [auth, done,formationEffectue]);

    if (loading)
        return <Loading />

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {!formationEffectue && (
                <View style={styles.centeredView}>
                    <FormButton
                        buttonTitle="Commencer ma formation éco-énergétique"
                        onPress={() => navigation.navigate('formation')}
                    />
                    <Text style={styles.introText}>
                        Les questions suivantes nous permettrons de construire un suivi et de vous permettre de réduire votre emprunte environnementale
                    </Text>
                </View>
            )}

            {formationEffectue &&
                (
                    <View>
                        <View>
                            <Text style={styles.title}>Ce que vous avez sauvé dans les derniers 24H</Text>
                            {/* Pedometre */}
                            <View style={{ flexDirection: 'row', flex: 2, alignItems: 'center', margin: 10 }}>
                                <Image
                                    style={{ padding: 10, borderRadius: 60 }}

                                    width={100}
                                    height={100}
                                    resizeMode='contain'
                                    source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/mobilemuniles.appspot.com/o/Images%2Fcoureurse.gif?alt=media&token=bc1b55b4-9fb4-48ea-a337-a540e43ba8b1' }}
                                />
                                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={styles.text}>Pas dans les derniers 24h : 
                                        <Text style={{ fontWeight: 'bold' }}>{pastStepCount}</Text>
                                    </Text>
                                    <Text style={styles.text}>
                                        <Text style={{ fontWeight: 'bold' }}>{nbKiloGesSauve} </Text>
                                        kg de CO2 sauvé</Text>
                                </View>
                            </View>

                            {/* Vélo */}
                            <View style={{ flexDirection: 'row', flex: 2, alignItems: 'center', margin: 10 }}>
                                <Image
                                    style={{ padding: 10, borderRadius: 60 }}
                                    width={100}
                                    height={100}
                                    resizeMode='contain'
                                    source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/mobilemuniles.appspot.com/o/Images%2Fvelo.gif?alt=media&token=3d9223e1-1228-4be1-a276-00e6c88f641e' }}
                                />
                                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={styles.text}>Nombre de kilomètres parcourus en vélo dans les derniers 24h : 0</Text>
                                    <Text style={styles.text}>
                                        <Text style={{ fontWeight: 'bold' }}>{nbKiloGesSauve} </Text>
                                        kg de CO2 sauvé</Text>
                                </View>
                            </View>
                        </View>

                        <Text style={styles.title}>Conseil et astuces</Text>

                        {/* Diaporama d'images */}
                        <View>
                            <Slideshow />
                        </View>

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


                        {/* Carte */}
                        <View>
                            <Text style={styles.title}>Simulations</Text>
                            <FormInput
                                label={'Simulation en année'}
                                useState={setYearSelection}
                                valueUseState={yearSelection}
                                placeholder={'Année'}
                                onSubmitEditing={() => setUrl(url)}
                                inputMode='numeric'
                            />
                            <WebView
                                source={{ uri: url }}
                                style={styles.webview}
                                allowsFullscreenVideo={false}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                                startInLoadingState={true}
                                renderLoading={() => <ActivityIndicator color="#0000ff" />
                                }
                            />
                        </View>

                        {/* Vidéos */}
                        <View style={styles.section}>
                            <Text style={styles.title}>Liste de vidéos intéressantes</Text>
                            {/* <Text style={styles.title}>Vidéo écolo-éducatives</Text> */}
                            {liste_url_videos.map((item, index) => (
                                <View>
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
                )}
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
    }
});
