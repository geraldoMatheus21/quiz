import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getQuizByCode } from "../services/quizservice";

export default function StudentEntry() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const quiz = await getQuizByCode(code.trim().toUpperCase());
      if (quiz) {
        navigate(`/play/${quiz.id}`);
      } else {
        setError("Código inválido. Verifique e tente novamente.");
      }
    } catch (err) {
      setError("Erro ao buscar quiz.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Quiz Criativo</h2>
        <p className="text-center mb-4">Digite o código do quiz</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Código (ex: ABC123)"
            className="w-full p-2 mb-4 border rounded text-center uppercase"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Jogar
          </button>
        </form>
      </div>
    </div>
  );
}