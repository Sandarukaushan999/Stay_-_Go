import React, { createContext, useContext, useState, useEffect } from 'react';
import en from './en.json';
import ta from './ta.json';
import si from './si.json';

const translations = { English: en, Tamil: ta, Sinhala: si };

const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('sg-admin-language') || 'English';
  });

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[lang] || translations['English'];
    
    for (const k of keys) {
      if (value === undefined) break;
      value = value[k];
    }
    
    // Fallback to English
    if (value === undefined) {
      let fallback = translations['English'];
      for (const k of keys) {
        if (fallback === undefined) break;
        fallback = fallback[k];
      }
      return fallback || key;
    }
    return value;
  };

  const changeLanguage = (newLang) => {
    if (translations[newLang]) {
      setLang(newLang);
      localStorage.setItem('sg-admin-language', newLang);
    }
  };

  return (
    <TranslationContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => useContext(TranslationContext);
