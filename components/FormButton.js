////////////////////////////////////////////////
// FormButton
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////

////////////////////////////////////////////////
// App
////////////////////////////////////////////////
const FormButton = ({onPress,buttonTitle,backgroundColor='#060270',color='white'})=> {
  return (
   <View style={{margin:10}}>
        <TouchableOpacity onPress={onPress}
            style={{backgroundColor:backgroundColor,borderRadius:60}}
        >
            <View style={{alignItems:'center'}}>
                <Text style={{color:color,padding:10}}>{buttonTitle}</Text>
            </View>
        </TouchableOpacity>
   </View>
  );
}

export default FormButton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});