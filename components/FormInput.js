////////////////////////////////////////////////////
//         Municipalité des Îles-de-la-Madeleine        //
//               Auteur: Iohann Paquette              //
//                     Date: 2024-05-07                 //
////////////////////////////////////////////////////

////////////////////////////////////////////////////
//                Bibliothèques                      //
////////////////////////////////////////////////////
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
    ScrollView
} from 'react-native';

////////////////////////////////////////////////////
//                 Composants                       //
////////////////////////////////////////////////////

////////////////////////////////////////////////////
//                  FormInput                       //
////////////////////////////////////////////////////
const FormInput = ({ label, placeholder, useState, valueUseState, secureTextEntry = false, inputMode = 'text',onSubmitEditing=null }) => {
    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <TextInput
                    placeholder={placeholder}
                    onChangeText={useState}
                    value={valueUseState}
                    style={styles.input}
                    placeholderTextColor={'#999999'}
                    blurOnSubmit
                    secureTextEntry={secureTextEntry}
                    inputMode={inputMode}
                    returnKeyType='done'
                    onSubmitEditing={onSubmitEditing}
                    showSoftInputOnFocus={false}
                />
               </TouchableWithoutFeedback>
        </View>
    );
}

export default FormInput;

const styles = StyleSheet.create({
    field: {
        marginBottom: 20,
        padding: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    label: {
        fontSize: 18,
        color: '#333',
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#fff',
        color: '#333',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        width: '100%',
        height: 40,
    },
    inner: {
        flexGrow: 1,
        padding: 20,
    }
});
