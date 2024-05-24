////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////

////////////////////////////////////////////////
//App
////////////////////////////////////////////////
const VideoComponent = ({ url,title }) => {

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.video}>
            <WebView
                    style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height / 10 }}
                    source={{ uri: url }}
                />
            </View>
        </View>
    );
}

export default VideoComponent;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        margin:20
    },
    video: {
        alignSelf: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        margin: 24,
        textAlign: 'center',
        color: '#333',
    }
});