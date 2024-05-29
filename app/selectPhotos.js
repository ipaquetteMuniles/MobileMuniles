////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import { StyleSheet, Text, View,Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import React,{useState,useEffect} from "react";
import {getAuth} from "firebase/auth";
import { getStorage, ref,uploadBytes,getDownloadURL  } from "firebase/storage";
import {updateDoc,doc,getFirestore} from "firebase/firestore";
import { useNavigation } from 'expo-router';
////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////
import FormButton from "../components/FormButton";
import Popup from "../components/Popup";
////////////////////////////////////////////////
// App
////////////////////////////////////////////////
const SelectPhotos = ()=> {

//Constants
const no_profile_pic_url = 'https://firebasestorage.googleapis.com/v0/b/mobilemuniles.appspot.com/o/Images%2Fno_profile_pic.jfif?alt=media&token=31e6531d-110d-4ae0-aa80-d1ea8fc2c47a'
const navigation = useNavigation()
const [image, setImage] = useState(null);
const user = getAuth().currentUser // actual user
const db = getFirestore()
const storage = getStorage();

//popup
const [textModal, setTextModal] = useState("");
const [modalVisible, setModalVisible] = useState(false);

////////////////////////////////////////////////
// Functions
////////////////////////////////////////////////

const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
    });
    if (!result.canceled)
        saveImage(result);
};

const saveImage = async (result) => {
    try {
        const file = result.assets[0];
        setImage(file.uri);

        const fileName = file.fileName ? file.fileName : `${new Date().getTime()}.jpg`;

        //convert Uri to Blob
        const response = await fetch(file.uri);
        const blob = await response.blob();

        //endroit du stockage de l'image
        const storageRef = ref(storage, `profils_images/${user.uid}/${fileName}`)

       /* await uploadBytes(storageRef, blob)
            .catch((err) => console.error('Error while uploading photo:', err))
*/
        /*await getDownloadURL(storageRef)
            .then((u)=>{
                saveImageInDb(u)
            })
            .catch((err)=>console.log(err))*/

    } catch (err) {
        console.error('Error in saveImage function:', err);
        setTextModal('Erreur rencontrée, veuillez essayer plus tard ..')
        setModalVisible(true)
    }
}

const saveImageInDb = async(url) =>{
    await updateDoc(doc(db,'Users',user.uid),{
        photoURL:url
    })
        .then(()=>console.log('photo in db updated !'))
}

return (
    <View style={styles.container}>

            <Text style={styles.label}>Photo de profil actuel</Text>

            <Image
                source={{uri: image? image : no_profile_pic_url}}
                width={200}
                height={200}
            />

        <FormButton
            buttonTitle={'Sélectionner une nouvelle photo de profil'}
            onPress={pickImage}
            />

        <FormButton
            backgroundColor={'red'}
            buttonTitle={'Retour'}
            onPress={()=>navigation.navigate('profil')}
            />
        <Popup text={textModal} setModalVisible={setModalVisible} modalVisible={modalVisible} />

    </View>
);
}

export default SelectPhotos;

const styles = StyleSheet.create({
container: {
    flexGrow: 1,
    padding: 16,
    alignItems:'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
},
label: {
    fontSize: 20,
    color: '#060270',
    marginBottom: 10,
    fontWeight: 'bold',
}
});