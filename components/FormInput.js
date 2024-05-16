////////////////////////////////////////////////////
//         Municipalité des Îles-de-la-Madeleine        //
//               Auteur: Iohann Paquette              //
//                     Date: 2024-05-07                 //
////////////////////////////////////////////////////

////////////////////////////////////////////////////
//                Bibliothèques                      //
////////////////////////////////////////////////////
import { StyleSheet, Text, View, TextInput } from 'react-native';

////////////////////////////////////////////////////
//                 Composants                       //
////////////////////////////////////////////////////

////////////////////////////////////////////////////
//                  FormInput                       //
////////////////////////////////////////////////////
const FormInput = ({ label, placeholder, useState, valueUseState, secureTextEntry = false, inputMode = 'text' }) => {
    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                placeholder={placeholder}
                onChangeText={useState}
                value={valueUseState}
                style={styles.input}
                placeholderTextColor={'#999999'}
                blurOnSubmit
                secureTextEntry={secureTextEntry}
                inputMode={inputMode}
            />
        </View>
    );
}

export default FormInput;

const styles = StyleSheet.create({
    field: {
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    },
    label: {
        fontSize: 20,
        color: '#060270',
        marginBottom: 10,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: '#0E1442',
        color: 'white',
        borderColor: '#999999',
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        width: '100%',
    },
});
