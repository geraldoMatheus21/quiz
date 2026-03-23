import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

export const createQuiz = async (quizData, userId) => {
  try {
    const quizRef = await addDoc(collection(db, "quizzes"), {
      ...quizData,
      createdBy: userId,
      createdAt: new Date(),
      accessCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
    });
    return quizRef.id;
  } catch (error) {
    console.error("Erro ao criar quiz:", error);
    throw error;
  }
};

export const getUserQuizzes = async (userId) => {
  try {
    const q = query(collection(db, "quizzes"), where("createdBy", "==", userId));
    const querySnapshot = await getDocs(q);
    const quizzes = [];
    querySnapshot.forEach((doc) => {
      quizzes.push({ id: doc.id, ...doc.data() });
    });
    return quizzes;
  } catch (error) {
    console.error("Erro ao buscar quizzes:", error);
    throw error;
  }
};

export const getQuizByCode = async (code) => {
  try {
    const q = query(collection(db, "quizzes"), where("accessCode", "==", code));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error("Erro ao buscar quiz por código:", error);
    throw error;
  }
};

export const getQuestions = async (quizId) => {
  try {
    const questionsCol = collection(db, "quizzes", quizId, "questions");
    const querySnapshot = await getDocs(questionsCol);
    const questions = [];
    querySnapshot.forEach((doc) => {
      questions.push({ id: doc.id, ...doc.data() });
    });
    return questions;
  } catch (error) {
    console.error("Erro ao buscar perguntas:", error);
    throw error;
  }
};

export const addQuestion = async (quizId, questionData) => {
  try {
    const questionsCol = collection(db, "quizzes", quizId, "questions");
    const docRef = await addDoc(questionsCol, {
      ...questionData,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao adicionar pergunta:", error);
    throw error;
  }
};

export const saveAttempt = async (quizId, studentId, answers, score, total) => {
  try {
    const attemptRef = await addDoc(collection(db, "attempts"), {
      quizId,
      studentId,
      answers,
      score,
      total,
      createdAt: new Date(),
    });
    return attemptRef.id;
  } catch (error) {
    console.error("Erro ao salvar tentativa:", error);
    throw error;
  }
};