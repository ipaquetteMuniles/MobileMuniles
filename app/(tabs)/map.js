////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications'
////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////
import { erosions_db } from '../../EROSIONS_DB'
////////////////////////////////////////////////
// App
////////////////////////////////////////////////
const Map = () => {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState("")
    const location_refresh_time = 2000 // in ms

    const GEOFENCE_TASK = 'geofence_task';

    const requestPermissions = async () => {
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
        if (foregroundStatus === 'granted') {
            const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
            if (backgroundStatus === 'granted') {
                let location = await Location.getCurrentPositionAsync({});
                setLocation(location);

            }
            else {
                setErrorMsg('Permission to access location was denied');
            }
        }
    };

    const FollowUser = async () =>{
        console.log('here')
        await Location.startGeofencingAsync('geofence1',
        [
            {
                identifier: 'geofence1',
                latitude: 47.37492106924283,
                longitude: -61.86988562683622,
                radius: 0.2,//in meters
                notifyOnEnter: true,
                notifyOnExit: false

            }
        ]);
        // erosions_db.forEach(element => {

        //     await Location.startGeofencingAsync('geofence1', 
        //     [
        //         {
        //             identifier:'geofence1',
        //             latitude:element.latitude,
        //             longitude:element.longitude,
        //             radius:100,//in meters
        //             notifyOnEnter:true,
        //             notifyOnExit:false                             

        //         }
        //     ]);
        // });

    }

    const AlertUser = async () => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "You've got mail! 📬",
                body: 'Here is the notification body',
                data: { data: 'goes here', test: { test1: 'more data' } },
            },
            trigger: { seconds: 2 },
        });

    }

    useEffect(() => {
        requestPermissions()
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            //FollowUser()
        }, location_refresh_time);

        return () => clearInterval(interval);

    }, []);

    //check position and if close to erosion site, it notify the user
    TaskManager.defineTask(GEOFENCE_TASK, async({ data, error }) => {
        if (error) {
            console.log(error)
            // Error occurred - check `error.message` for more details.
            return;
        }
        if (data) {
            const { eventType } = data;

            if (eventType === Location.GeofencingEventType.Enter) {
                AlertUser()
                console.log('YEPPP')
            }
            else if(eventType === Location.GeofencingEventType.Exit)
                console.log('bye bye')
        }
    });

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                showsUserLocation
                initialRegion={{
                    longitude: erosions_db[0].longitude,
                    latitude: erosions_db[0].latitude,
                    latitudeDelta: 0.001,
                    longitudeDelta: 0.01
                }}
            >
                {erosions_db.map((element, index) => (
                    <Marker
                        key={index}
                        coordinate={{
                            latitude: element.latitude,
                            longitude: element.longitude
                        }}
                        title={element.title}
                    />
                ))}
            </MapView>

        </View>
    );


}

export default Map;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#060270',
        margin: 10,
        borderRadius: 60
    },
    map: {
        width: '100%',
        height: '100%',
    }
});