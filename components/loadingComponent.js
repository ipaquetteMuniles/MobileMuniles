////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import { StyleSheet, Text, View,Image } from 'react-native';

////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////

////////////////////////////////////////////////
// App
////////////////////////////////////////////////
const Loading = ()=> {
    const uri_image_loading = 'https://firebasestorage.googleapis.com/v0/b/mobilemuniles.appspot.com/o/Images%2Fcoureurse.gif?alt=media&token=bc1b55b4-9fb4-48ea-a337-a540e43ba8b1'
  return (
   <View style={styles.container}>
           <Image
               source={{uri:uri_image_loading}}
                style={{
                    width:100,
                    height:100,
                    borderRadius:60
                }}
           />
   </View>
  );
}

export default Loading;

const styles = StyleSheet.create({
   container: {
        flexGrow: 1,
        padding: 16,
        alignItems:'center',
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
    }
});