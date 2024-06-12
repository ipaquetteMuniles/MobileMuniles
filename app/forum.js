////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import {StyleSheet, Text, View, FlatList, TextInput, Image, ScrollView} from 'react-native';
import React, {useEffect, useState} from "react";
import FormButton from "../components/FormButton";
import LoadingComponent from "../components/loadingComponent";
import {getAuth} from "firebase/auth";

////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////
import AstuceInputFlatlist from "../components/astuceInputFlatlist";
////////////////////////////////////////////////
// App
////////////////////////////////////////////////
const Forum = ()=>
{
    ////////////////////////////////////////////////
    // Fonctions
    ////////////////////////////////////////////////

    return (
       <ScrollView>
           <AstuceInputFlatlist nbItemToRender={100}/>
       </ScrollView>
    );
}

export default Forum;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
        color: '#333',
    },
});