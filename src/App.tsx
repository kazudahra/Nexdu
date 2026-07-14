import { useState, useEffect } from "react";
import DirectorPanel from "./director-panel";
import TeacherDashboard from "./teacher-dashboard";

function App() {
  // Brauzer URL manzilidan qaysi sahifadaligimizni aniqlaymiz: e.g. /teacher yoki /director
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  // Direktor paneli yo'li
  if (path === "/director" || path === "/director/") {
    return <DirectorPanel />;
  }

  // O'qituvchi paneli yo'li
  if (path === "/teacher" || path === "/teacher/") {
    return <TeacherDashboard />;
  }

  // Bosh sahifaga kirganda tanlash oynasi (yoki login sahifasi)
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white font-sans p-4">
      <div className="max-w-md w-full space-y-8 bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Nexdu CRM
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Tizimga kirish uchun rolingizni tanlang
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={() => {
              window.history.pushState({}, "", "/director");
              setPath("/director");
            }}
            className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg shadow-indigo-500/20"
          >
            <span>💼 Direktor Paneli</span>
            <span className="text-xs bg-indigo-500 px-2 py-1 rounded">
              Kirish →
            </span>
          </button>

          <button
            onClick={() => {
              window.history.pushState({}, "", "/teacher");
              setPath("/teacher");
            }}
            className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg shadow-purple-500/20"
          >
            <span>👨‍🏫 O'qituvchi Paneli</span>
            <span className="text-xs bg-purple-500 px-2 py-1 rounded">
              Kirish →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
