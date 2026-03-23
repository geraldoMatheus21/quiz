import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getUserQuizzes, createQuiz } from "../services/quizservice";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { currentUser, logout, userName } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    loadQuizzes();
  }, []);

  async function loadQuizzes() {
    const data = await getUserQuizzes(currentUser.uid);
    setQuizzes(data);
  }

  async function handleCreateQuiz(e) {
    e.preventDefault();
    if (!title.trim()) return;
    const newQuiz = {
      title,
      description,
      theme: {
        primaryColor: "#3B82F6",
        backgroundColor: "#F3F4F6",
        buttonColor: "#3B82F6",
      },
    };
    await createQuiz(newQuiz, currentUser.uid);
    setTitle("");
    setDescription("");
    loadQuizzes();
  }

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

      <form onSubmit={handleCreateQuiz} className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Criar novo quiz</h2>
        <input
          type="text"
          placeholder="Título do quiz"
          className="w-full p-2 mb-3 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Descrição (opcional)"
          className="w-full p-2 mb-3 border rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Criar Quiz
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="border rounded p-4 shadow">
            <h3 className="font-bold text-lg">{quiz.title}</h3>
            <p className="text-gray-600">{quiz.description}</p>
            <p className="text-sm text-gray-500 mt-2">
              Código: <span className="font-mono">{quiz.accessCode}</span>
            </p>
            <Link
              to={`/quiz/edit/${quiz.id}`}
              className="inline-block mt-3 text-blue-600 hover:underline"
            >
              Editar perguntas
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}