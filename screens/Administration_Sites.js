//////////////////////////////////////////////
// Municipalité des Îles-de-la-Madeleine
// Auteur : Iohann Paquette
// Date : 2024-05-07
/* Objectif: Pouvoir contrôler les différents sites des Îles-de-la-Madeleine
grâce à une interface web. De plus, nous connectons cette plateforme à
un serveur Python, qui lui se connectera à un thermostat intelligent */
////////////////////////////////////////////////

////////////////////////////////////////////////
// Bibliothèques
////////////////////////////////////////////////
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ref, onValue } from 'firebase/database';
import { Calendar } from 'react-native-calendars';
import CsvDownloadButton from 'react-json-to-csv';
import moment from 'moment'; // Importation de moment.js
import { Feather } from "@expo/vector-icons";

////////////////////////////////////////////////
// Components
////////////////////////////////////////////////
import Header from '../components/header';
import FormButton from '../components/FormButton';
import Popup from '../components/Popup';
import { database } from '../firebase/fire';

const Administration = ({ navigation, route }) => {
    const [loading, setLoading] = useState(false);
    const [collectedData, setCollectedData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
    const [showCalendar, setShowCalendar] = useState(false);
    const [textModal, setTextModal] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [sortByAsc, setSortByAsc] = useState(true);
    const [selectedZone, setSelectedZone] = useState('THERMOSTAT_2');
    const [zones, setZones] = useState([]);

    const getFormattedDate = (date) => {
        return moment(date).format('MM-DD-YYYY') + '-THERMOSTAT_DATA';
    };

    const fetchData = () => {
        try {
            setLoading(true);
            setCollectedData([]);
            setSelectedZone(null);
            // Aller chercher les différentes zones
            const zoneRef = ref(database, '/');

            onValue(zoneRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const uniqueZones = new Set();
                    Object.keys(data).forEach((key) => {
                        Object.keys(data[key]).forEach((zoneName, i) => {
                            uniqueZones.add(zoneName);
                        });
                    });
                    // Mettre à jour les zones avec les noms uniques
                    setZones([...uniqueZones]);
            
                    // Sélectionner la première zone par défaut
                    if (uniqueZones.size > 0) {
                        setSelectedZone(uniqueZones.values().next().value);
                    }
                }

            });

            // Aller chercher les data des zones
            console.log(selectedZone);
            const formattedDate = getFormattedDate(selectedDate);
            const dataRef = ref(database, `9159953/${selectedZone}/${formattedDate}`);

            onValue(dataRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const formattedData = Object.values(data);
                    setCollectedData(formattedData);

                }
            });
        } catch (err) {
            console.log(err);
            setTextModal("Erreur lors de la requête des données. Réessayez plus tard.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const sortByDate = () => {
        const sortedData = [...collectedData].sort((a, b) => {
            const dateA = moment(a.timestamp);
            const dateB = moment(b.timestamp);
            return sortByAsc ? dateA - dateB : dateB - dateA;
        });
        setCollectedData(sortedData);
        setSortByAsc(!sortByAsc); // Inverser l'ordre de tri après chaque clic
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator animating={true} size={'large'} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header navigation={navigation} nomPage={'Administration'} />

            <ScrollView style={styles.formContainer}>
                    <View style={{ backgroundColor: 'white' }}>
                        <Text style={styles.headerText}>
                            Veuillez choisir une zone parmi les suivantes
                        </Text>
                        {zones.length > 0 && (
                            <View>

                                {zones.map((zone, index) => (
                                    <TouchableOpacity key={index} onPress={() => setSelectedZone(zone)}>
                                        <View style={index % 2 === 0 ? styles.dataRowPair : styles.dataRowImpair}>
                                            <Text style={styles.cellText}>
                                                {index + 1} - {zone}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
               

                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    {showCalendar && (
                        <View>
                            <Calendar
                                onDayPress={(day) => setSelectedDate(day.dateString)}
                                markedDates={{
                                    [selectedDate]: { selected: true, disableTouchEvent: true, selectedDotColor: 'blue' },
                                }}
                            />
                            <Text style={styles.title}>{selectedDate.toString()}</Text>
                        </View>
                    )}
                    <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                        <FormButton
                            buttonTitle={'Confirmer'}
                            onPress={fetchData}
                        />
                        <FormButton
                            onPress={() => setShowCalendar(!showCalendar)}
                            buttonTitle={showCalendar ? 'Annuler' : 'Sélectionner une autre date'}
                        />
                    </View>
                </View>

                {collectedData.length === 0 && (<Text style={styles.title}>En recherche ...</Text>)}
                {collectedData.length > 0 && (
                    <View>
                        <View style={styles.buttonContainer}>
                            <CsvDownloadButton data={collectedData} filename={`Thermostat_${new Date().toLocaleDateString()}`} />
                        </View>

                        <View style={styles.tableContainer}>
                            <View style={styles.tableHeader}>
                                <Text style={styles.headerText}>Device_id</Text>
                            </View>
                            <View style={styles.tableHeader}>
                                <TouchableOpacity onPress={sortByDate}>
                                    <Text style={styles.headerText}>
                                        Date
                                        <Feather
                                            name={sortByAsc ? 'arrow-down' : 'arrow-up'}
                                            size={25}
                                        />
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.tableHeader}>
                                <Text style={styles.headerText}>Zone</Text>
                            </View>
                            <View style={styles.tableHeader}>
                                <Text style={styles.headerText}>Temp. intérieure (°C)</Text>
                            </View>
                            <View style={styles.tableHeader}>
                                <Text style={styles.headerText}>Temp. extérieure (°C)</Text>
                            </View>
                            <View style={styles.tableHeader}>
                                <Text style={styles.headerText}>Hum. extérieure (%)</Text>
                            </View>
                            <View style={styles.tableHeader}>
                                <Text style={styles.headerText}>Point de consigne chaud</Text>
                            </View>
                            <View style={styles.tableHeader}>
                                <Text style={styles.headerText}>Point de consigne froid</Text>
                            </View>
                            <View style={styles.tableHeader}>
                                <Text style={styles.headerText}>Ventilateur en fonctionnement</Text>
                            </View>
                        </View>

                        {collectedData.map((value, index) => (
                            <View style={index % 2 === 0 ? styles.dataRowPair : styles.dataRowImpair} key={index}>
                                <View style={styles.dataCell}>
                                    <Text style={styles.cellText}>{value.device_id}</Text>
                                </View>
                                <View style={styles.dataCell}>
                                    <Text style={styles.cellText}>
                                        {moment(value.timestamp).format('YYYY-MM-DD HH:mm:ss')}</Text>
                                </View>
                                <View style={styles.dataCell}>
                                    <Text style={styles.cellText}>{value.zone_name}</Text>
                                </View>
                                <View style={styles.dataCell}>
                                    <Text style={styles.cellText}>{value.display_temperature}</Text>
                                </View>
                                <View style={styles.dataCell}>
                                    <Text style={styles.cellText}>{value.outdoor_temperature}</Text>
                                </View>
                                <View style={styles.dataCell}>
                                    <Text style={styles.cellText}>{value.outdoor_humidity}</Text>
                                </View>
                                <View style={styles.dataCell}>
                                    <Text style={styles.cellText}>{value.heat_setpoint}</Text>
                                </View>
                                <View style={styles.dataCell}>
                                    <Text style={styles.cellText}>{value.cool_setpoint}</Text>
                                </View>
                                <View style={styles.dataCell}>
                                    <Text style={styles.cellText}>{value.fan_is_running ? 'Oui' : 'Non'}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                <Popup
                    text={textModal}
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E3E6E8',
        alignItems: 'center',
    },
    formContainer: {
        width: '95%',
    },
    tableContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: 'white',
        alignItems: 'center',
    },
    dataRowPair: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: '#F5F8FA',
        alignItems: 'center',
    },
    dataRowImpair: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: '#E8ECEE',
        alignItems: 'center',
    },
    tableHeader: {
        width: '10%',
        borderRightWidth: 1,
        borderRightColor: '#D7DADC',
        padding: 5,
    },
    dataCell: {
        width: '10%',
        borderRightWidth: 1,
        borderRightColor: '#D7DADC',
        padding: 5,
    },
    headerText: {
        fontWeight: 'bold',
        color: 'black',
    },
    cellText: {
        color: 'black',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
        margin: 10,
        textAlign: 'center',
    },
    buttonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
    },
});

export default Administration;
