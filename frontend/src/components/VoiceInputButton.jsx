import React, { useState, useEffect } from 'react';
import { useSpeechToText } from '../hooks/useSpeechToText';

const VoiceInputButton = ({ onResult, className = "" }) => {
  const [showPulse, setShowPulse] = useState(false);
  
  const { isListening, transcript, startListening, stopListening, error } = useSpeechToText({
    onResult: (text) => {
      onResult(text);
    },
    lang: 'fr-FR' // Default to French as the app seems to be in French
  });

  useEffect(() => {
    if (error) {
      console.error('Speech recognition error:', error);
      alert(`Erreur de reconnaissance vocale: ${error}`);
    }
  }, [error]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
        isListening 
          ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-110" 
          : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
      } ${className}`}
      title={isListening ? "Arrêter l'écoute" : "Saisir par la voix"}
    >
      {isListening && (
        <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-25"></span>
      )}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {isListening ? (
          <>
            <rect x="6" y="6" width="12" height="12" />
          </>
        ) : (
          <>
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </>
        )}
      </svg>
    </button>
  );
};

export default VoiceInputButton;
