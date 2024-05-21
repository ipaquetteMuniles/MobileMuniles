////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import { StyleSheet, Text, View } from 'react-native';
// import MapView from 'react-native-maps';
////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////

////////////////////////////////////////////////
// App
////////////////////////////////////////////////
const App = () => {
    return (
        <View style={styles.container}>
            {/* <MapView style={styles.map} /> */}

        </View>
    );
}

export default App;

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