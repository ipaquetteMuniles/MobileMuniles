////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, Image,FlatList } from 'react-native';
import {
    getAuth

} from 'firebase/auth';
import { useNavigation } from 'expo-router';
import { Video } from 'expo-av';
////////////////////////////////////////////////
//Components
////////////////////////////////////////////////
import { liste_url_videos } from '../../BD_VIDEOS'
import VideoComponent from '../../components/video'
////////////////////////////////////////////////
//App
////////////////////////////////////////////////
export default function Home() {
    const auth = getAuth()
    const navigation = useNavigation();

    useEffect(() => {
        if (!auth.currentUser)
            navigation.navigate('index')
    }, [])

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Formations éco-énergétique</Text>

            {/* Liste des différentes vidéos */}
            <FlatList
                data={liste_url_videos}
                renderItem={(item)=>{
                    return(
                        <VideoComponent url={item.item.url} title={item.item.title}/>
                    )
                }}
            />
        </ScrollView>
    )
}


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
    }
});