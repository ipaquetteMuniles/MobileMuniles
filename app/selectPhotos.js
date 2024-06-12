////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07
////////////////////////////////////////////////

////////////////////////////////////////////////
//	Bibliothèques
////////////////////////////////////////////////
import {StyleSheet, Text, View, Image, ActivityIndicator} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import {updateDoc, doc, getFirestore, getDoc} from "firebase/firestore";
import { useNavigation } from 'expo-router';
import { useLocalSearchParams } from "expo-router";
import * as Progress from 'react-native-progress';

////////////////////////////////////////////////
//	Composants
////////////////////////////////////////////////
import FormButton from "../components/FormButton";
import Popup from "../components/Popup";
import LoadingComponent from "../components/loadingComponent";

////////////////////////////////////////////////
// App
////////////////////////////////////////////////
const SelectPhotos = () => {

	//Constants
	const no_profile_pic_url = 'https://firebasestorage.googleapis.com/v0/b/mobilemuniles.appspot.com/o/Images%2Fno_profile_pic.jfif?alt=media&token=31e6531d-110d-4ae0-aa80-d1ea8fc2c47a'
	const uri_image_loading = 'https://firebasestorage.googleapis.com/v0/b/mobilemuniles.appspot.com/o/Images%2Fcoureurse.gif?alt=media&token=bc1b55b4-9fb4-48ea-a337-a540e43ba8b1'

	const { urlParams } = useLocalSearchParams();

	const navigation = useNavigation()
	const [image, setImage] = useState(urlParams ? urlParams:no_profile_pic_url);
	const [bytesTransfered,setBytesTransfered] = useState(0)
	const [loading,setLoading] = useState(false)
	const [currentPhoto,setCurrentPhoto] = useState()
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
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== 'granted') {
			setTextModal("Permission refusée, vous devez permettre l'accès à la bibliothèque de photos.");
			setModalVisible(true);
			return;
		}

		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
		});
		if (!result.canceled)
			await saveImage(result);
	};

	const getCurrentPhoto =async ()=>{
		await getDoc(doc(db,'Users',user.uid))
			.then((res)=>{
				if(res.exists())
				{
					setCurrentPhoto(res.data().photoFileName)
					console.log(res.data().photoFileName)
				}
			})
			.catch((err)=>console.log(err))
	}

	const deleteImageFromStorage = async () =>
	{
		const storageRef = ref(storage, `profils_images/${user.uid}/${currentPhoto}`)
		await deleteObject(storageRef)
			.then(() => console.log('image has been deleted sucessfully'))
			.catch((err) => {
				console.log(err)
				setTextModal('Erreur rencontrée, veuillez essayer plus tard ..');
				setModalVisible(true);
				setLoading(false);
			})
	}

	const saveImage = async (result) => {
		try {
			setLoading(true)
			if (!result.assets || result.assets.length === 0) {
				throw new Error('No assets found in the result.');
			}

			//delete previous photo
			await deleteImageFromStorage()

			const file = result.assets[0];
			setImage(file.uri);

			const fileName = file.fileName ? file.fileName : `${new Date().getTime()}.jpg`;

			// Log the file information
			console.log('File info:', file);

			// Convert Uri to Blob
			const response = await fetch(file.uri);
			const blob = await response.blob();

			// Log the blob information
			console.log('Blob info:', blob);

			// Endroit du stockage de l'image
			const storageRef = ref(storage, `profils_images/${user.uid}/${fileName}`);

			// Upload the file
			const uploadTask = uploadBytesResumable(storageRef, blob, {
				contentType: file.mimeType || 'image/jpeg',
			});

			uploadTask.on('state_changed',
				(snapshot) => {
					// Progress function
					const progress = (snapshot.bytesTransferred / snapshot.totalBytes);
					setBytesTransfered(progress);
				},
				(error) => {
					// Error function
					setLoading(false);
					setTextModal('Erreur lors du téléchargement de la photo');
					setModalVisible(true);
					console.error('Upload error:', error);
				},
				async () => {
					const downloadURL = await getDownloadURL(storageRef)
					await saveImageInDb(downloadURL,fileName)

					setLoading(false);
					setTextModal('Image téléchargée avec succès !');
					setModalVisible(true);

					console.log('Image uploaded...');
				}
			);

		} catch (err) {
			console.error('Error in saveImage function:', err);
			setTextModal('Erreur rencontrée, veuillez essayer plus tard ..');
			setModalVisible(true);
			setLoading(false);
		}
	};

	const saveImageInDb = async (url,fileName) => {
		await updateDoc(doc(db, 'Users', user.uid), {
			photoURL: url,
			photoFileName : fileName
		})
			.catch((err)=>{
				console.log(err)
				setTextModal('Erreur rencontrée, veuillez essayer plus tard ..');
				setModalVisible(true);
				setLoading(false);
			})
			.then(() => console.log('photo in db updated !'))
	}

	useEffect(()=>{
		getCurrentPhoto()
	},[])

	if (loading) {
		return (
			<View style={styles.container}>
				<LoadingComponent />
				<Progress.Bar progress={bytesTransfered} width={200} showsText={true}/>
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<View>
				<Text style={styles.label}>Photo de profil actuel</Text>
				<Image
					source={{ uri: image ? image : no_profile_pic_url }}
					width={200}
					height={200}
					loadingIndicatorSource={{uri:no_profile_pic_url}}
				/>
			</View>

			<FormButton
				buttonTitle={'Sélectionner une nouvelle photo de profil'}
				onPress={pickImage}
			/>

			<FormButton
				backgroundColor={'red'}
				buttonTitle={'Retour'}
				onPress={() => navigation.navigate('profil')}
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
		alignItems: 'center',
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