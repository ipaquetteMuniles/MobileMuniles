////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { getFirestore, updateDoc } from 'firebase/firestore';
import { doc,setDoc } from 'firebase/firestore';
import { useNavigation } from 'expo-router';

////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////
import FormButton from '@/components/FormButton';
import { getAuth } from 'firebase/auth';
////////////////////////////////////////////////
// App
////////////////////////////////////////////////
const Formation = () => {
    const questions = [
        { id: 1, question: 'Possèdez-vous une ou plusieurs voitures ?' },
        { id: 2, question: 'Possèdez-vous un ou plusieurs vélos' },
        { id: 3, question: 'Êtes-vous résident des îles-de-la-Madeleine ?' },
    ];

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [finish,setFinish] = useState(false)

    const db = getFirestore()
    const auth = getAuth()

    const navigation = useNavigation();

    const handleAnswer = async(answer) => {
        const updatedAnswers = [...answers, { 
            id:questions[currentQuestionIndex].id,
            question: questions[currentQuestionIndex].question,
            answer }];

        setAnswers(updatedAnswers);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // Handle end of questions
            setFinish(true)
            
            //sauvegarder les questions dans la base de données
            await setDoc(doc(db,'Formation',auth.currentUser.uid),{
                answers:answers,
                user:auth.currentUser.uid
            })

            //mettre a jour le profil de l'utilisateur pour dire qu'il
            //a répondu au sondage
            await updateDoc(doc(db,'Users',auth.currentUser.uid),{
                FormationEffectue:true,
            })
        }
    };

    const QuestionComponent = ({ question, onAnswer }) => {
        return (
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{question}</Text>
            <View style={styles.buttonContainer}>
              <FormButton buttonTitle="Yes" onPress={() => onAnswer(true)} />
              <FormButton buttonTitle="No" onPress={() => onAnswer(false)} />
            </View>
          </View>
        );
      };

    return (
        <View style={styles.container}>
            {/* premiere question */}
            {currentQuestionIndex == 0 && (
                <Text style={{fontSize: 24,fontWeight:'bold'}}>
                    Les questions suivantes nous permettrons de construire un suivi et
                    de vous permettre de réduire votre emprunte environnementale
                </Text>
            )}

            {!finish ? (
                <QuestionComponent
                    question={questions[currentQuestionIndex].question}
                    onAnswer={handleAnswer}
                />
            ) : (
                <View>
                    <Text style={styles.endText}>Merci d'avoir répondu aux questions de la formation</Text>
                    <FormButton
                        buttonTitle="Retour"
                        onPress={()=>navigation.navigate("accueil")}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    questionContainer: {
        alignItems: 'center',
    },
    questionText: {
        fontSize: 24,
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '60%',
    },
    endText: {
        fontSize: 24,
        textAlign: 'center',
    },
});

export default Formation;