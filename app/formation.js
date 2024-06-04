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
import { useNavigation,Link,useRouter, useLocalSearchParams } from 'expo-router';
import {questions} from '../Questions'
////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////
import FormButton from '@/components/FormButton';
import { getAuth } from 'firebase/auth';
////////////////////////////////////////////////
// App
////////////////////////////////////////////////
const Formation = () => {
    

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [finish,setFinish] = useState(false)

    const db = getFirestore()
    const auth = getAuth()

    const navigation = useNavigation();
    const router = useRouter();

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

            router.push({ params: { done: true } });
        }
    };

    const QuestionComponent = ({ question, onAnswer }) => {
        return (
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{question}</Text>
            <View style={styles.buttonContainer}>
              <FormButton buttonTitle="Oui" onPress={() => onAnswer(true)} />
              <FormButton buttonTitle="Non" onPress={() => onAnswer(false)} />
            </View>
          </View>
        );
      };

    return (
        <View style={styles.container}>
           
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
                            onPress={()=>{
                                if(auth.currentUser)
                                    navigation.navigate("accueil")
                                else
                                    navigation.navigate("index")
                            }}
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