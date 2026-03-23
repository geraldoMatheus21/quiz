import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";

export default function StudentDashboard() {
  const { currentUser, logout, userName } = useAuth(); // <-- receba userName
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      // Buscar todos os quizzes
      const quizzesSnap = await getDocs(collection(db, "quizzes"));
      const allQuizzes = quizzesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuizzes(allQuizzes);

      // Buscar tentativas do aluno
      const attemptsQuery = query(
        collection(db, "attempts"),
        where("studentId", "==", currentUser.uid)
      );
      const attemptsSnap = await getDocs(attemptsQuery);
      const userAttempts = attemptsSnap.docs.map(doc => doc.data());

      // Calcular estatísticas por quiz
      const statsMap = {};
      userAttempts.forEach(attempt => {
        const quizId = attempt.quizId;
        const percent = (attempt.score / attempt.total) * 100;
        if (!statsMap[quizId]) {
          statsMap[quizId] = { bestScore: percent, attempts: 1 };
        } else {
          statsMap[quizId].attempts++;
          if (percent > statsMap[quizId].bestScore) {
            statsMap[quizId].bestScore = percent;
          }
        }
      });
      setStats(statsMap);
    };
    fetchData();
  }, [currentUser]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Olá, {userName || currentUser?.email}</h1>
        <button
          onClick={logout}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Sair
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-4">Quizzes disponíveis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes.map((quiz) => {
          const stat = stats[quiz.id];
          return (
            <div key={quiz.id} className="border rounded p-4 shadow">
              <h3 className="font-bold text-lg">{quiz.title}</h3>
              <p className="text-gray-600">{quiz.description}</p>
              {stat && (
                <p className="text-sm mt-2">
                  Melhor acerto: {stat.bestScore.toFixed(0)}% ({stat.attempts} tentativas)
                </p>
              )}
              <Link
                to={`/student/play/${quiz.id}`}
                className="inline-block mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Jogar
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}