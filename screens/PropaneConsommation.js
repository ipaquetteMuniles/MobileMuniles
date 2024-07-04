////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import React, { useState, useEffect,useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, Picker } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/fire';
import { doc, getDoc } from 'firebase/firestore';
import CsvDownloadButton from 'react-json-to-csv'
import RadioGroup from 'react-native-radio-buttons-group';

////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////
import Header from '../components/header';
import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';
import Popup from '../components/Popup';
import { liste_batiments_propane } from '../utiles/liste_batiments_propane';

const PropaneConsommationForm = ({ navigation, route }) => {
    const user = auth.currentUser;
    const [isAdmin, setIsAdmin] = useState(false)

    const [numProduit, setNumProduit] = useState('');
    const [date, setDate] = useState(new Date());
    const [nomsite, setNomsite] = useState('');
    const [description,setDescription] = useState('')//falcultatif
    const [quantite,setQuantite] = useState('')
    const [prixTotal, setPrixTotal] = useState('');
    const [selectedQt, setselectedQt] = useState();

    const [textModal, setTextModal] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    const [dataPropane, setDataPropane] = useState([])

    const radioButtons = useMemo(() => ([
        {
            id: '1',
            label: 'Livres',
            value: 'lbs'
        },
        {
            id: '2',
            label: 'Litres',
            value: 'l'
        }
    ]), []);

    const submit = async () => {

        if (!numProduit || !nomsite || !quantite || !prixTotal || !selectedQt) {
            setTextModal('Assurez-vous de remplir tous les champs du formulaire.');
            setModalVisible(true);
        } else {
            const tableName = "ConsommationPropane"

            await addDoc(collection(db, tableName), {
                date: date,
                numProduit: numProduit,
                nomsite:nomsite,
                description:description,
                quantite:quantite,
                selectedQt: selectedQt == 1 ? 'livres':'litres',
                prixTotal:prixTotal
            })
                .then(() => {
                    //Annoncer que les données ont été submit
                    setTextModal('Les données ont été enregistrées !');
                    setModalVisible(true);

                    //reset les entrées
                    setDate(new Date())
                    setNomsite('')
                    setNumProduit('')
                    setDescription('')
                    setQuantite('')
                    setPrixTotal('')

                    //reset les data
                    setDataPropane([])
                })
                .catch((err) => {
                    setModalVisible(true)
                    setTextModal('Erreur interne : Contacter iohann');
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

    const getPropaneData = async () => {
        //aller chercher toute les données du Mazout dans la BD
        let array = []
        const tableName = "ConsommationPropane"
        await getDocs(collection(db, tableName))
            .then((d) => {
                //foreach doc
                d.forEach((data) => {
                    array.push(data.data())
                })
            })
        setDataPropane(array)
    }

    useEffect(() => {
        getUserInfo()
        getPropaneData()
    }, [])
    
    return (
        <View style={styles.container}>
            <Header navigation={navigation} nomPage={'PropaneConsommationForm'} />
            <ScrollView>
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Formulaire de consommation de Propane</Text>

                    {/* si administrateur, alors peut downloader le excel avec données */}
                    {isAdmin && (
                        <View style={styles.buttonContainer}>
                            <CsvDownloadButton data={dataPropane} filename={`Propane_${new Date().toLocaleDateString()}`} />
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
                            label={'Référence'}
                            placeholder={'Référence...'}
                            useState={setNumProduit}
                            valueUseState={numProduit}
                            textContentType={'none'}
                        />
                    </View>

                    {/* nomsite */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Nom du site de la livraison</Text>
                        <Picker
                            selectedValue={nomsite}
                            onValueChange={(itemValue, itemIndex) =>
                                setNomsite(itemValue)
                            }>
                            <Picker.Item label={'Sélectionner un élément'} value={null} />
                            {liste_batiments_propane.map((item, index) => (
                                <Picker.Item key={index} label={item} value={item} />
                            ))}
                        </Picker>
                    </View>

                    {/* Quantité */}
                    <View style={styles.field}>
                        {/* sélection livre ou lbs */}
                        <RadioGroup 
                            radioButtons={radioButtons} 
                            onPress={setselectedQt}
                            selectedId={selectedQt}
                            labelStyle={{color:'white',fontWeight:'bold',fontSize:25}}
                            containerStyle={{flexDirection:'row',flex:2}}
                        
                        />
                        <FormInput
                            label={`Quantité en ${selectedQt == 1 ? 'livres':'litres'}`}
                            placeholder={"Qt"}
                            useState={setQuantite}
                            valueUseState={quantite}
                            textContentType={'number'}
                            keyboardType={'numeric'}
                        />
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
                onCloseFct={() => console.log('all good !')}
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

export default PropaneConsommationForm;
