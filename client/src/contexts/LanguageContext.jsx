'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    dashboard: 'Dashboard',
    courses: 'Courses',
    leaderboard: 'Leaderboard',
    forum: 'Forum',
    liveClasses: 'Live Classes',
    logout: 'Logout',
    learning: 'My Learning',
    wishlist: 'Wishlist',
    welcomeBack: 'Welcome back',
    totalPoints: 'Total Points',
    codingScore: 'Coding Score',
    enrolled: 'Enrolled'
  },
  es: {
    dashboard: 'Tablero',
    courses: 'Cursos',
    leaderboard: 'Clasificación',
    forum: 'Foro',
    liveClasses: 'Clases en Vivo',
    logout: 'Cerrar Sesión',
    learning: 'Mi Aprendizaje',
    wishlist: 'Lista de Deseos',
    welcomeBack: 'Bienvenido de nuevo',
    totalPoints: 'Puntos Totales',
    codingScore: 'Puntaje de Código',
    enrolled: 'Inscrito'
  },
  fr: {
    dashboard: 'Tableau de Bord',
    courses: 'Cours',
    leaderboard: 'Classement',
    forum: 'Forum',
    liveClasses: 'Cours en Direct',
    logout: 'Se Déconnecter',
    learning: 'Mon Apprentissage',
    wishlist: 'Liste de Souhaits',
    welcomeBack: 'Bon retour',
    totalPoints: 'Points Totaux',
    codingScore: 'Score de Codage',
    enrolled: 'Inscrit'
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    courses: 'पाठ्यक्रम',
    leaderboard: 'लीडरबोर्ड',
    forum: 'फ़ोरम',
    liveClasses: 'लाइव कक्षाएं',
    logout: 'लॉग आउट',
    learning: 'मेरी शिक्षा',
    wishlist: 'इच्छा-सूची',
    welcomeBack: 'वापसी पर स्वागत है',
    totalPoints: 'कुल अंक',
    codingScore: 'कोडिंग स्कोर',
    enrolled: 'नामांकित'
  },
  de: {
    dashboard: 'Dashboard',
    courses: 'Kurse',
    leaderboard: 'Bestenliste',
    forum: 'Forum',
    liveClasses: 'Live-Klassen',
    logout: 'Abmelden',
    learning: 'Mein Lernen',
    wishlist: 'Wunschzettel',
    welcomeBack: 'Willkommen zurück',
    totalPoints: 'Gesamtpunktzahl',
    codingScore: 'Codierungs-Ergebnis',
    enrolled: 'Eingeschrieben'
  },
  zh: {
    dashboard: '仪表板',
    courses: '课程',
    leaderboard: '排行榜',
    forum: '论坛',
    liveClasses: '直播课',
    logout: '登出',
    learning: '我的学习',
    wishlist: '心愿单',
    welcomeBack: '欢迎回来',
    totalPoints: '总积分',
    codingScore: '编程得分',
    enrolled: '已报名'
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('app-language');
    if (saved && translations[saved]) {
      setLanguage(saved);
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('app-language', lang);
  };

  const t = (key) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
