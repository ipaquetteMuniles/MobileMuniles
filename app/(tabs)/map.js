////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////
import { erosions_db } from '../../EROSIONS_DB'
////////////////////////////////////////////////
// App
////////////////////////////////////////////////
const Map = () => {
    return (
        <View style={styles.container}>
            <MapView 
                style={styles.map}
                showsUserLocation
                initialRegion={{
                    longitude:erosions_db[0].longitude,
                    latitude:erosions_db[0].latitude,
                    latitudeDelta:0.001,
                    longitudeDelta:0.01
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