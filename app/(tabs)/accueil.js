import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, FlatList, Linking } from 'react-native';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { liste_url_videos } from '../../BD_VIDEOS';
import VideoComponent from '@/components/video';
import FormButton from '@/components/FormButton';
import Slideshow from '@/components/Slideshow';
import { useLocalSearchParams } from "expo-router";

export default function Home() {
    const auth = getAuth();
    const navigation = useNavigation();
    const db = getFirestore();
    const [userInfo, setUserInfo] = useState();
    const [formationEffectue, setFormationDone] = useState(false);
    const { done } = useLocalSearchParams();

    const getUserInfo = async () => {
        try {
            const docSnap = await getDoc(doc(db, 'Users', auth.currentUser.uid));
            if (docSnap.exists()) {
                setUserInfo(docSnap.data());
                if (docSnap.data().FormationEffectue) {
                    setFormationDone(true);
                }
            }
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        if (!auth.currentUser) {
            navigation.navigate('index');
        } else {
            getUserInfo();
        }
    }, [auth, done]);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {!formationEffectue && (
                <View style={styles.centeredView}>
                    <FormButton
                        buttonTitle="Commencer ma formation éco-énergétique"
                        onPress={() => navigation.navigate('formation')}
                    />
                    <Text style={styles.introText}>
                        Les questions suivantes nous permettrons de construire un suivi et de vous permettre de réduire votre emprunte environnementale
                    </Text>
                </View>
            )}

            {formationEffectue && (
                <View>
                    <Text style={styles.title}>Conseil et astuces</Text>
                    <View style={styles.section}>
                        <Text style={styles.undertitle}>Compostage</Text>
                        <Text style={styles.text}>
                            Mettez du papier et du carton dans votre bac brun. Cela empêche le gel des matières en hiver et enlève les odeurs en été.
                        </Text>
                        <Text style={styles.text}>
                            Mettez vos matières en vrac dans votre bac. Sinon, favorisez les sacs en papier ou les sacs certifiés compostables.
                        </Text>
                        <Text style={styles.text}>
                            Saviez-vous qu’avec l’ensemble des matières compostables collectées sur le territoire, la Municipalité fait un compost de très bonne qualité? Vous pouvez vous en procurer au CGMR au coût de 5 $ pour l’équivalent d’un bac brun (240 litres ou 3 paniers à poissons) ou 25 $ la tonne (une boîte de camion). N’oubliez pas d’apporter vos contenants! Rappelez-vous que la qualité de ce produit découle directement de vos efforts à bien faire le tri à la source des matières résiduelles.
                        </Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.undertitle}>Recyclage</Text>
                        <Text style={styles.text}>
                            N’oubliez pas de rincer vos contenants afin de faciliter la récupération des matières. Les contenants non lavés souillent le reste des matières.
                        </Text>
                        <Text style={styles.text}>
                            Réunissez toutes les pellicules plastiques dans un sac transparent noué, vous éviterez qu’elles s’envolent et atterrissent dans notre environnement.
                        </Text>
                        <Text style={styles.text}>
                            Les sacs biodégradables ne sont ni recyclables, ni compostables et vont au bac noir.
                        </Text>
                        <Text style={styles.text}>
                            Les matières recyclables doivent être déposées en vrac dans votre bac vert (sans sac).
                        </Text>
                        <Text style={styles.text}>
                            Les bouteilles et les canettes consignées peuvent être rapportées au magasin ou donner à des organismes.
                        </Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.undertitle}>Déchets</Text>
                        <Text style={styles.text}>
                            Ne mettez jamais de produits dangereux dans votre bac noir,
                            <Text style={styles.link} onPress={() => Linking.openURL('https://www.muniles.ca/services-aux-citoyens/matieres-residuelles/ecocentre-et-points-de-depots/')}>
                                ils doivent être disposés correctement aux endroits appropriés.
                            </Text>
                        </Text>
                    </View>

                    <View>
                        <Slideshow />
                    </View>
                    <View>
                        <Text style={styles.title}>Vidéo écolo-éducatives</Text>
                        <FlatList
                            style={styles.flatList}
                            data={liste_url_videos}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => <VideoComponent url={item.url} title={item.title} />}
                        />
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        backgroundColor: '#f9f9f9',
        marginTop: 40,
    },
    centeredView: {
        alignItems: 'center',
    },
    introText: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
        color: '#333',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
        color: '#333',
    },
    section: {
        marginBottom: 20,
    },
    undertitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    text: {
        fontSize: 16,
        marginBottom: 10,
        color: '#555',
    },
    link: {
        color: 'blue',
    },
    flatList: {
        margin: 20,
    },
});
