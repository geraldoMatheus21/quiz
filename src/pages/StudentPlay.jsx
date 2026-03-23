import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { getQuestions, saveAttempt } from "../services/quizservice";
import { useAuth } from "../contexts/AuthContext";

export default function StudentPlay() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const quizDoc = await getDoc(doc(db, "quizzes", quizId));
        if (quizDoc.exists()) {
          setQuiz({ id: quizDoc.id, ...quizDoc.data() });
        } else {
          navigate("/student/dashboard");
          return;
        }
        const questionsList = await getQuestions(quizId);
        setQuestions(questionsList);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [quizId, navigate]);

  const handleAnswer = (selectedIndex) => {
    const newAnswers = [...answers, { questionId: questions[currentIndex].id, selected: selectedIndex }];
    setAnswers(newAnswers);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Calcular pontuação
      let correctCount = 0;
      newAnswers.forEach((ans, idx) => {
        if (ans.selected === questions[idx].correctOption) correctCount++;
      });
      setScore(correctCount);
      setFinished(true);
      // Salvar tentativa com studentId
      saveAttempt(quizId, currentUser.uid, newAnswers, correctCount, questions.length);
    }
  };

  if (loading) return <div className="p-8">Carregando quiz...</div>;
  if (!quiz) return <div className="p-8">Quiz não encontrado</div>;
  if (finished) {
    const percent = (score / questions.length) * 100;
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4">Fim do quiz!</h2>
          <p className="text-xl mb-4">
            Você acertou {score} de {questions.length} perguntas ({percent.toFixed(0)}%).
          </p>
          <button
            onClick={() => navigate("/student/dashboard")}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Voltar para meus quizzes
          </button>
        </div>
      </div>
    );
  }

  const current = questions[currentIndex];
  if (!current) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
        <div className="mb-4 text-sm text-gray-500">
          Pergunta {currentIndex + 1} de {questions.length}
        </div>
        <h2 className="text-xl font-bold mb-4">{current.text}</h2>
        <div className="space-y-3">
          {current.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className="w-full text-left p-3 border rounded hover:bg-gray-50 transition"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}