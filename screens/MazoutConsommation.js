////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Picker } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/fire';
import { doc, getDoc } from 'firebase/firestore';
import CsvDownloadButton from 'react-json-to-csv'

////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////
import Header from '../components/header';
import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';
import Popup from '../components/Popup';
import { lites_batiments_mazout } from '../utiles/liste_batiments_mazout';

const MazoutConsommationForm = ({ navigation, route }) => {
    const user = auth.currentUser;
    const [isAdmin, setIsAdmin] = useState(false)

    const [numProduit, setNumProduit] = useState('');
    const [date, setDate] = useState(new Date());
    const [nomsite, setNomsite] = useState('');
    const [prixTotal, setPrixTotal] = useState('');
    const [prixUnitaire, setPrixUnitaire] = useState('');
    const [nomMazout, setNomMazout] = useState('');
    const [quantite, setQuantite] = useState('');
    const [description,setDescription] = useState('')//falcultatif

    //Popup
    const [textModal, setTextModal] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    const [dataMazout, setDataMazout] = useState([])

    const submit = async () => {

        if (!numProduit || !nomsite || !prixTotal || !prixUnitaire || !nomMazout || !quantite) {
            setTextModal('Assurez-vous de remplir tous les champs du formulaire.');
            setModalVisible(true);
        } else {
            const tableName = "ConsommationMazout"

            await addDoc(collection(db, tableName), {
                date: date,
                numProduit: numProduit,
                nomsite: nomsite,
                prixUnitaire: prixUnitaire,
                prixTotal: prixTotal,
                nomMazout: nomMazout,
                quantite: quantite,
                description:description
            })
                .then(() => {
                    //Annoncer que les données ont été submit
                    setTextModal('Les données ont été enregistrées !');
                    setModalVisible(true);

                    //reset les entrées
                    setNumProduit('');
                    setDate(new Date());
                    setNomsite('');
                    setPrixTotal('');
                    setPrixUnitaire('');
                    setNomMazout('');
                    setQuantite('');
                    setDescription('')
                    setDataMazout([])
                })
                .catch((err) => {
                    setErreur('Erreur interne : Contacter iohann');
                    console.log(err);
                });
        }
    };

    const getUserInfo = async () => {
        const tableName = "Users"
        const docRef = doc(db, tableName, user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            if (docSnap.data().isAdmin)
                setIsAdmin(true)
        } else {
            console.log("No such document!");
        }
    }

    const getMazoutData = async () => {
        //aller chercher toute les données du Mazout dans la BD
        let array = []
        const tableName = "ConsommationMazout"
        await getDocs(collection(db, tableName))
            .then((d) => {
                //foreach doc
                d.forEach((data) => {
                    array.push(data.data())
                })
            })

        setDataMazout(array)
    }

    useEffect(() => {
        getUserInfo()
        getMazoutData()
    }, [])

    return (
        <View style={styles.container}>
            <Header navigation={navigation} nomPage={'MazoutConsommationForm'} />
            <ScrollView>
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Formulaire de consommation de Mazout</Text>

                    {/* si administrateur, alors peut downloader le excel avec données */}
                    {isAdmin && (
                        <View style={styles.buttonContainer}>
                            <CsvDownloadButton data={dataMazout} filename={`Mazout_${new Date().toLocaleDateString()}`} />
                        </View>
                    )}

                    <View style={styles.field}>
                        <Text style={styles.label}>Date</Text>
                        <Calendar
                            onDayPress={(day) => {
                                setDate(day.dateString);
                            }}
                            markedDates={{
                                [date]: { selected: true, disableTouchEvent: true, selectedDotColor: 'blue' },
                            }}
                            style={styles.calendar}
                            theme={styles.calendarTheme}
                        />
                    </View>

                    {/* Numéro de produit */}
                    <View style={styles.field}>
                        <FormInput
                            label={'Numéro de produit'}
                            placeholder={'# ...'}
                            useState={setNumProduit}
                            valueUseState={numProduit}
                            textContentType={'none'}
                        />
                    </View>


                    {/* Type de mazout */}
                    <View style={styles.field}>
                        <FormInput
                            label={"Type de mazout"}
                            placeholder={"coloré, ... ?"}
                            useState={setNomMazout}
                            valueUseState={nomMazout}
                            textContentType={'none'}
                        />
                    </View>

                    {/* nomsite */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Nom du site</Text>
                        <Picker
                            selectedValue={nomsite}
                            onValueChange={(itemValue, itemIndex) =>
                                setNomsite(itemValue)
                            }>
                            <Picker.Item label={'Sélectionner un élément'} value={null} />
                            {lites_batiments_mazout.map((item, index) => (
                                <Picker.Item key={index} label={item} value={item} />
                            ))}
                        </Picker>
                    </View>

                    {/* Montant après taxe, total */}
                    <View style={styles.field}>
                        <FormInput
                            label={"Montant total"}
                            placeholder={"après taxe ... $"}
                            useState={setPrixTotal}
                            valueUseState={prixTotal}
                            textContentType={'none'}
                        />
                    </View>

                    {/* Quantité */}
                    <View style={styles.field}>
                        <FormInput
                            label={"Quantité (L)"}
                            placeholder={"Qt en litres"}
                            useState={setQuantite}
                            valueUseState={quantite}
                            textContentType={'number'}
                            keyboardType={'numeric'}
                        />
                    </View>

                    {/* Prix unitaire */}
                    <View style={styles.field}>
                        <FormInput
                            label={"Prix unitaire du litre"}
                            placeholder={"Prix au litre"}
                            useState={setPrixUnitaire}
                            valueUseState={prixUnitaire}
                            textContentType={'number'}
                            keyboardType={'numeric'}
                        />
                    </View>

                    {/* Description optionnelle */}
                    <View style={styles.field}>
                        <FormInput
                            label={"Description"}
                            placeholder={"Optionnel ..."}
                            useState={setDescription}
                            valueUseState={description}
                            textContentType={'none'}
                            multiline={true}
                        />
                    </View>
                </View>

                {/* submit button */}
                <View style={styles.buttonContainer}>
                    <FormButton buttonTitle={'Enregistrer'} onPress={submit} />
                </View>
            </ScrollView>

            <Popup
                text={textModal}
                setModalVisible={setModalVisible}
                modalVisible={modalVisible}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    formContainer: {
        backgroundColor: '#0E1442',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
    },
    title: {
        fontSize: 25,
        color: 'white',
        fontWeight: 'bold',
        marginBottom: 20,
    },
    field: {
        color:'white',
        marginBottom: 20,
    },
    label: {
        fontSize: 20,
        color: 'white',
        marginBottom: 10,
    },
    calendar: {
        borderRadius: 10,
    },
    calendarTheme: {
        backgroundColor: '#ffffff',
        calendarBackground: '#ffffff',
        textSectionTitleColor: '#b6c1cd',
        selectedDayBackgroundColor: '#00adf5',
        selectedDayTextColor: '#ffffff',
        todayTextColor: '#00adf5',
        dayTextColor: '#2d4150',
        textDisabledColor: '#d9e',
    },
    buttonContainer: {
        alignItems: 'center',
    },
});

export default MazoutConsommationForm;
