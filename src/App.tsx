import { useState, useEffect } from "react";

// Vercel qiynalmasligi uchun .jsx kengaytmalari aniq yozildi
import Director from "./director.jsx";
import Manager from "./manager.jsx";
import Student from "./student.jsx";
import Teacher from "./teacher.jsx";

function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  const navigate = (newPath) => {
    window.history.pushState({}, "", newPath);
    setPath(newPath);
  };

  // 1. Direktor
  if (path === "/director" || path === "/director/") {
    return <Director onNavigate={navigate} />;
  }

  // 2. Menejer
  if (path === "/manager" || path === "/manager/") {
    return <Manager onNavigate={navigate} />;
  }

  // 3. O'qituvchi
  if (path === "/teacher" || path === "/teacher/") {
    return <Teacher onNavigate={navigate} />;
  }

  // 4. O'quvchi
  if (path === "/student" || path === "/student/") {
    return <Student onNavigate={navigate} />;
  }

  // Bosh sahifa — Rol tanlash oynasi
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white font-sans p-4 relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl opacity-30 bg-indigo-600 pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-30 bg-purple-600 pointer-events-none" />

      <div className="max-w-md w-full space-y-8 bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-slate-700/50 relative z-10">
        <div className="text-center">
          <div className="text-4xl mb-2">🎓</div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Nexdu CRM
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Tizimga kirish uchun rolingizni tanlang
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={() => navigate("/director")}
            className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold rounded-2xl transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg shadow-indigo-500/20"
          >
            <span className="flex items-center gap-2">💼 Direktor Paneli</span>
            <span className="text-xs bg-indigo-500/40 border border-indigo-400/30 px-2.5 py-1 rounded-lg">Kirish →</span>
          </button>

          <button
            onClick={() => navigate("/manager")}
            className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-semibold rounded-2xl transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg shadow-emerald-500/20"
          >
            <span className="flex items-center gap-2">📊 Menejer Paneli</span>
            <span className="text-xs bg-emerald-500/40 border border-emerald-400/30 px-2.5 py-1 rounded-lg">Kirish →</span>
          </button>

          <button
            onClick={() => navigate("/teacher")}
            className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-2xl transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg shadow-purple-500/20"
          >
            <span className="flex items-center gap-2">👨‍🏫 O'qituvchi Paneli</span>
            <span className="text-xs bg-purple-500/40 border border-purple-400/30 px-2.5 py-1 rounded-lg">Kirish →</span>
          </button>

          <button
            onClick={() => navigate("/student")}
            className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-semibold rounded-2xl transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg shadow-blue-500/20"
          >
            <span className="flex items-center gap-2">🧑‍🎓 O'quvchi Paneli</span>
            <span className="text-xs bg-sky-500/40 border border-sky-400/30 px-2.5 py-1 rounded-lg">Kirish →</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
