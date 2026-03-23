import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-8">Quiz Criativo</h1>
      <div className="space-y-4">
        <Link
          to="/student/login"
          className="block w-64 text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Sou Aluno
        </Link>
        <Link
          to="/teacher/login"
          className="block w-64 text-center bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
        >
          Sou Professor
        </Link>
      </div>
    </div>
  );
}