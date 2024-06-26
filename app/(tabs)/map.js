////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur : Iohann Paquette
// Date : 2024-05-07
////////////////////////////////////////////////

////////////////////////////////////////////////
// Bibliothèques
////////////////////////////////////////////////
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView}
    from 'react-native';

import MapView, { Marker, Polyline } from 'react-native-maps';
import {setDoc,getDoc,doc, getFirestore, updateDoc,arrayUnion,Timestamp} from "firebase/firestore";
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Feather } from "@expo/vector-icons";
import haversine from 'haversine';
import {getAuth} from "firebase/auth";

////////////////////////////////////////////////
// Composants
////////////////////////////////////////////////
import { erosions_db } from '../../EROSIONS_DB';
import FormButton from "../../components/FormButton";
import Loading from "../../components/loadingComponent";
import Popup from "../../components/Popup";
import {Pedometer} from "expo-sensors";
////////////////////////////////////////////////
// App
////////////////////////////////////////////////
const Map = () => {
    const [location, setLocation] = useState(null);
    const [locationPermission, setLocationPermission] = useState(false);
    const [showErosionsPoints,setErosionsPoints] = useState(false)
    const [notifyErosionPoints,setNotifyErosionsPoints] = useState(true)

    const [route, setRoute] = useState([]);
    const [distance, setDistance] = useState(0);
    const [currentSteps, setCurrentSteps] = useState(0);
    const [tracking, setTracking] = useState(false);
    const [showEffort, setShowEffort] = useState(false);
    const [effortType,setEffortType] = useState("");
    const [effortId,setEffortId] = useState()

    const [textModal, setTextModal] = useState("");
    const [modalVisible, setModalVisible] = useState(false);

    const db = getFirestore()
    const auth = getAuth()

    const threshold_distance_erosion = 0.6;
    const location_refresh_time = 100000; // in ms
    let stepSubscription;

    const requestPermissions = async () => {
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
        if (foregroundStatus === 'granted') {
            setLocationPermission(true);
            await Location.getCurrentPositionAsync().then((loc) => {
                setLocation({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude
                });
            });
        } else {
            setTextModal("Accès à l'application refusé. Réessayer plus tard");
            setLocation(null)
            setModalVisible(true)
        }
    };

    const stopActivity = async (type) => {
        switch (type) {
            case 'bike':
                await stopEffort('Efforts_Bike');
                break;
            case 'walk':
                await stopEffort('Efforts_Walk');
                break;
            case 'run':
                await stopEffort('Efforts_Run');
                break;
            default:
                break;
        }
    };

    const startActivity = async (type) => {
        switch (type) {
            case 'bike':
                await startEffort('Efforts_Bike','bike');
                break;
            case 'walk':
                await startEffort('Efforts_Walk','walk');
                break;
            case 'run':
                await startEffort('Efforts_Run','run');
                break;
            default:
                break;
        }
    };

    const handleStartStop = async (type) => {
        setEffortType(type)

        if (locationPermission) {
            if (tracking) {
                await stopActivity(type);
                setTracking(false);
                setRoute([]);
                setDistance(0);
            } else {
                await startActivity(type);
                setTracking(true);
                setShowEffort(false);
            }
        }
        else{
            await requestPermissions()
        }
    }

    const startEffort = async (tableName,type) =>{
        await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.BestForNavigation,
                distanceInterval: 1,
            },
            (newLocation) => {
                const { latitude, longitude } = newLocation.coords;
                setLocation({ latitude, longitude });
                setRoute((prevRoute) => {
                    const newRoute = [...prevRoute, { latitude, longitude }];
                    if (prevRoute.length > 0) {
                        const distanceIncrement = haversine(prevRoute[prevRoute.length - 1], { latitude, longitude });
                        setDistance((prevDistance) => prevDistance + distanceIncrement);
                    }
                    return newRoute;
                });
            }
        );
        if(type == 'run' || type == 'walk')
        {
            const isAvailable = await Pedometer.isAvailableAsync();
            if (isAvailable) {
                setCurrentSteps(0)
                stepSubscription = Pedometer.watchStepCount(result => {
                    setCurrentSteps(result.steps);
                });
            }
        }

        const userDocRef = doc(db, tableName, auth.currentUser.uid)
        const id = `${auth.currentUser.uid}_${new Date().getTime()}`
        const newEffort = {
            startTime: Timestamp.fromDate(new Date()),
            uid:  auth.currentUser.uid,
            type: type,
            effortId: id
        };

        await setDoc(userDocRef, {
            efforts: arrayUnion(newEffort)
        }, { merge: true })
            .then(() => {
                setEffortId(id);
            })
            .catch((err) => {
                console.error('Error starting effort: ', err);
            });
    }

    const stopEffort = async (tableName)=> {
        const user = auth.currentUser;
        const userDocRef = doc(db, tableName, user.uid);

        try {
            const docSnapshot = await getDoc(userDocRef);

            if (!docSnapshot.exists()) {
                console.error('Effort document does not exist:', user.uid);
                return;
            }

            const efforts = docSnapshot.data().efforts || [];
            const effortIndex = efforts.findIndex(effort => effort.effortId === effortId);

            if (effortIndex === -1) {
                console.error('Effort not found:', effortId);
                return;
            }

            const updatedEffort = {
                ...efforts[effortIndex],
                endTime: Timestamp.fromDate(new Date()),
                distance: distance,
                totalSteps:currentSteps
            };

            if (stepSubscription) {
                stepSubscription.remove();
            }

            const updatedEfforts = [
                ...efforts.slice(0, effortIndex),
                updatedEffort,
                ...efforts.slice(effortIndex + 1)
            ];


            await updateDoc(userDocRef, {
                efforts: updatedEfforts
            });

            let string = ''

            switch (effortType)
            {
                case 'bike':
                    string = 'vélo';
                    break;
                case 'run':
                    string = 'course';
                    break;
                case 'walk':
                    string = 'marche';
                    break
                default:
                    break;

            }
            setEffortType(null)
            setTextModal(`Bravo pour votre entrainement de ${string}`)
            setModalVisible(true)
            setEffortId(null);
        } catch (err) {
            console.error('Error stopping effort:', err);
        }
    }

    const WatchErosionSectors = async () => {
       if(location){
           erosions_db.forEach((element) => {

               const distance = haversine(
                   { latitude:location.latitude, longitude:location.longitude },
                   { latitude: element.latitude, longitude: element.longitude }
               );

               if (distance <= threshold_distance_erosion) {
                   //AlertUser();
                   console.log('proche de ',element.title)
               }
           });
       }
    };

    const AlertUser = async () => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Attention! 📬",
                body: 'Vous êtes proche d\'une zone d\'érosion.',
            },
            trigger: { seconds: 1 },
        })
    }

    useEffect(() => {
        requestPermissions();
    }, []);

    useEffect(() => {
            const interval = setInterval(() => {
                if(notifyErosionPoints)
                    WatchErosionSectors()
            }, location_refresh_time);

            return () => clearInterval(interval);

    }, [notifyErosionPoints]);

    if(!location || !locationPermission)
    {
        return (
            <View style={styles.container}>
                <Loading />
                {!locationPermission && (
                    <View>
                        <TouchableOpacity onPress={requestPermissions}>
                            <Text style={{fontWeight:'bold'}}>Me redemander les permissions de localisations</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        )
    }

    return (
        <View style={styles.container}>
                <MapView
                    style={styles.map}
                    showsUserLocation={true}
                    initialRegion={{
                        longitude: location.longitude,
                        latitude: location.latitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01
                    }}
                >
                    {showErosionsPoints && erosions_db.map((element, index) => (
                        <Marker
                            key={index}
                            coordinate={{
                                latitude: element.latitude,
                                longitude: element.longitude
                            }}
                            title={element.title}
                        />
                    ))}
                    {tracking && (
                        <Polyline coordinates={route} strokeWidth={5} strokeColor="blue" />
                    )}
                </MapView>

            <View style={styles.topContainer}>
                <View style={styles.searchBar}>
                    <TextInput
                        placeholder="Rechercher..."
                        style={styles.searchInput}
                        placeholderTextColor="gray"
                    />
                    {showEffort && (
                        <ScrollView>
                            <View style={styles.liste}>
                                <Text style={{fontWeight:'bold'}}>Points d'érosions</Text>
                                <TouchableOpacity
                                    style={styles.listeItem}
                                    onPress={() => setErosionsPoints(!showErosionsPoints)}
                                >
                                    <Text style={styles.listeItemText}>
                                        {showErosionsPoints ? `Enlever les points d'érosions` : `Me montrer les points d'érosions`}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.listeItem}
                                    onPress={() => setNotifyErosionsPoints(!notifyErosionPoints)}
                                >
                                    <Text style={styles.listeItemText}>
                                        {notifyErosionPoints ?`Enlever les notifications` :`Me notifier sur les points d'érosions`}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.liste}>
                                <Text style={{fontWeight:'bold'}}>Entrainements</Text>
                                <TouchableOpacity
                                    style={styles.listeItem}
                                    onPress={() => handleStartStop('bike')}
                                >
                                    <Text style={styles.listeItemText}>Vélo</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.listeItem}
                                    onPress={() => handleStartStop('walk')}
                                >
                                    <Text style={styles.listeItemText}>Marche</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.listeItem}
                                    onPress={() => handleStartStop('run')}
                                >
                                    <Text style={styles.listeItemText}>Course</Text>
                                </TouchableOpacity>
                            </View>

                        </ScrollView>
                    )}
                </View>

                <View style={styles.buttonContainer}>
                    <Feather
                        name={showEffort ? "menu" : "navigation"}
                        size={30}
                        color="#060270"
                        onPress={() => setShowEffort(!showEffort)}
                    />
                </View>
            </View>

            {tracking && (
                <View style={styles.statsContainer}>
                    <FormButton
                        buttonTitle="Arrêter l'entraînement"
                        onPress={() => handleStartStop(effortType)}
                        backgroundColor="#060270"
                        color="white"
                    />

                    <Text style={styles.statsText}>Distance : {distance.toFixed(2)} km</Text>
                    {(effortType == 'run' || effortType == 'walk') && (
                        <View>
                            <Text style={styles.statsText}>Nombre de pas :{currentSteps}</Text>
                        </View>
                    )}
                </View>
            )}

            <Popup text={textModal} setModalVisible={setModalVisible} modalVisible={modalVisible} />

        </View>
    );
};

export default Map;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        margin: 10,
        borderRadius: 10,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    topContainer: {
        position: 'absolute',
        top: 60,
        left: '5%',
        right: '5%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    searchBar: {
        flex: 2,
        marginRight: 10,
    },
    searchInput: {
        height: 40,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    buttonContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    liste: {
        backgroundColor: '#fff',
        marginTop: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
        padding: 10,
    },
    listeItem: {
        paddingVertical: 10,
        borderBottomColor: '#ddd',
        borderBottomWidth: 1,
    },
    listeItemText: {
        fontSize: 16,
        color: '#333',
    },
    statsContainer: {
        position: 'absolute',
        bottom: 20,
        left: '5%',
        right: '5%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
        alignItems: 'center',
    },
    statsText: {
        fontSize: 16,
        color: '#333',
    },
});
