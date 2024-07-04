////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import { StyleSheet, Text, View,TextInput } from 'react-native';

////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////

////////////////////////////////////////////////
// FormInput
////////////////////////////////////////////////
const FormInput = ({ label, placeholder, useState, valueUseState, secureTextEntry = false, textContentType,keyboardType,multiline=false}) => {
    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                autoFocus
                placeholder={placeholder}
                onChangeText={useState}
                value={valueUseState}
                style={styles.input}
                placeholderTextColor={'gray'}
                blurOnSubmit
                textContentType={textContentType}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                multiline={multiline}
                numberOfLines={multiline ? 4:1}
            />
        </View>
    );
}

export default FormInput;

const styles = StyleSheet.create({
    field: {
        marginBottom: 20,
    },
    label: {
        fontSize: 20,
        color:'white',
        marginBottom: 10,
    },
    input: {
        backgroundColor: '#0E1442',
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        color:'white'
    },
});