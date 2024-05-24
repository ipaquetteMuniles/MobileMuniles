////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, FlatList, Dimensions } from 'react-native';
import {
    getAuth

} from 'firebase/auth';
import { useNavigation } from 'expo-router';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { Fade } from "react-slideshow-image";

////////////////////////////////////////////////
//Components
////////////////////////////////////////////////
import { liste_url_videos } from '../../BD_VIDEOS'
import VideoComponent from '../../components/video'
import FormButton from '@/components/FormButton';
import Popup from '../../components/Popup';
import {slides} from '../../slides'
////////////////////////////////////////////////
//App
////////////////////////////////////////////////
export default function Home() {
    const auth = getAuth()
    const navigation = useNavigation();
    const db = getFirestore()
    const [userInfo, setUserInfo] = useState()
    const [formationEffectue, setFormationDone] = useState(false)

    //Popup
    const [textModal, setTextModal] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    const getUserInfo = async () => {
        await getDoc(doc(db, 'Users', auth.currentUser.uid))
            .then((res) => {
                setUserInfo(res.data())
                console.log(res.data().FormationEffectue)
                if (res.data().FormationEffectue == true) {
                    setFormationDone(true)

                }
            })
            .catch((err) => {
                console.log(err)
            })
    }
    const zoomOutProperties = {
        duration: 5000,
        transitionDuration: 500,
        infinite: true,
        indicators: true,
        scale: 0.4,
        arrows: true
      };

    useEffect(() => {
        if (!auth.currentUser)
            navigation.navigate('index')
        else
            getUserInfo()
    }, [auth])

    return (
        <ScrollView contentContainerStyle={styles.container}>

            {/* Si n'a pas fait sa formation encore */}
            {!formationEffectue && (
                <FormButton
                    buttonTitle={'Commencer ma formation éco-énergétique'}
                    onPress={() => navigation.navigate('formation')}
                />
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
                            
                            <a href='https://www.muniles.ca/services-aux-citoyens/matieres-residuelles/ecocentre-et-points-de-depots/'>ils doivent être disposés correctement aux endroits appropriés.</a>
                        </Text>
                    </View>
                </View>
            )}

            {/* image slide-show */}
            {/* <View>
            <div className="slide-container">
                <Fade {...zoomOutProperties}>
                    {slides.map((each, index) => (
                        <Image source={{uri:each}} id={index} width={200} height={200} resizeMethod='contain'/>
                    ))}
                </Fade>
                </div>
            </View> */}

            <Text style={styles.title}>Vidéo écolo-éducatives</Text>

            {/* Liste des différentes vidéos */}
            <FlatList
                data={liste_url_videos}
                renderItem={(item) => {
                    return (
                        <VideoComponent url={item.item.url} title={item.item.title} />
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
    }
});