import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { addQuestion, getQuestions } from "../services/quizservice";

export default function EditQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState(0);
  const [loading, setLoading] = useState(true);

  // Carregar quiz e perguntas
  useEffect(() => {
    const fetchData = async () => {
      try {
        const quizDoc = await getDoc(doc(db, "quizzes", quizId));
        if (quizDoc.exists()) {
          setQuiz({ id: quizDoc.id, ...quizDoc.data() });
        }
        const questionsList = await getQuestions(quizId);
        setQuestions(questionsList);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [quizId]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    const questionData = {
      text: questionText,
      options: options.filter(opt => opt.trim() !== ""),
      correctOption,
    };
    await addQuestion(quizId, questionData);
    // Limpar formulário
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectOption(0);
    // Recarregar perguntas
    const updated = await getQuestions(quizId);
    setQuestions(updated);
  };

  if (loading) return <div className="p-8">Carregando...</div>;
  if (!quiz) return <div className="p-8">Quiz não encontrado</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Voltar
      </button>
      <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
      <p className="text-gray-600 mb-6">{quiz.description}</p>

      <h2 className="text-xl font-semibold mb-4">Perguntas</h2>
      <div className="mb-8 space-y-4">
        {questions.length === 0 ? (
          <p className="text-gray-500">Nenhuma pergunta ainda. Adicione abaixo.</p>
        ) : (
          questions.map((q, idx) => (
            <div key={q.id} className="border p-4 rounded shadow-sm">
              <p className="font-medium">{idx + 1}. {q.text}</p>
              <ul className="list-disc ml-6 mt-2">
                {q.options.map((opt, i) => (
                  <li key={i} className={i === q.correctOption ? "text-green-600 font-semibold" : ""}>
                    {opt} {i === q.correctOption && "(correta)"}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      <h2 className="text-xl font-semibold mb-4">Adicionar nova pergunta</h2>
      <form onSubmit={handleAddQuestion} className="space-y-4 border-t pt-4">
        <div>
          <label className="block text-sm font-medium mb-1">Texto da pergunta</label>
          <textarea
            className="w-full border rounded p-2"
            rows="3"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Alternativas (preencha pelo menos duas)</label>
          {options.map((opt, idx) => (
            <input
              key={idx}
              type="text"
              placeholder={`Opção ${idx + 1}`}
              className="w-full border rounded p-2 mb-2"
              value={opt}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
            />
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Alternativa correta (índice)</label>
          <select
            className="border rounded p-2"
            value={correctOption}
            onChange={(e) => setCorrectOption(parseInt(e.target.value))}
          >
            {options.map((_, idx) => (
              <option key={idx} value={idx}>
                Opção {idx + 1}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Adicionar Pergunta
        </button>
      </form>
    </div>
  );
}