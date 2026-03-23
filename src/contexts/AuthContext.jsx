import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(name, email, password, role) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: name,
        email: email,
        role: role,
        createdAt: new Date(),
      });
      console.log("Usuário criado com nome:", name);
      return userCredential;
    } catch (error) {
      console.error("Erro no signup:", error);
      throw error;
    }
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserRole(data.role);
            setUserName(data.name);
            console.log("Nome carregado:", data.name);
          } else {
            // se não existe documento, cria um padrão (fallback)
            console.warn("Documento não encontrado, criando padrão");
            await setDoc(doc(db, "users", user.uid), {
              name: user.email.split('@')[0],
              email: user.email,
              role: "aluno",
              createdAt: new Date(),
            });
            setUserRole("aluno");
            setUserName(user.email.split('@')[0]);
          }
        } catch (error) {
          console.error("Erro ao buscar usuário:", error);
          setUserRole("aluno");
          setUserName(user.email.split('@')[0]);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setUserName(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    userName,
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div className="flex justify-center items-center h-screen">Carregando...</div>}
    </AuthContext.Provider>
  );
}