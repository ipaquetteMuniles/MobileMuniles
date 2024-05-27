////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import { StyleSheet, Text, View,ActivityIndicator,Image } from 'react-native';

////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////

////////////////////////////////////////////////
// App
////////////////////////////////////////////////
const Loading = ()=> {
  return (
   <View style={styles.container}>
        <ActivityIndicator animating={true} size={'large'}/>
        <Image 
            width={200}
            height={200}
            source={{uri:'https://www.muniles.ca/wp-content/uploads/2021/10/logo-muniles-light.svg'}}
            resizeMode='contain'
        />
   </View>
  );
}

export default Loading;

const styles = StyleSheet.create({
   container: {
        flexGrow: 1,
        padding: 16,
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
    }
});