import { useState, useCallback, useRef } from 'react';

export const useSpeechToText = (options = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    // Reset transcript on start
    finalTranscriptRef.current = '';
    setTranscript('');

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true; // Keep listening through pauses
    recognitionRef.current.interimResults = true; // Show interim results
    recognitionRef.current.lang = options.lang || 'fr-FR';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setError(null);
      finalTranscriptRef.current = '';
    };

    recognitionRef.current.onerror = (event) => {
      setError(event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.onresult = (event) => {
      // Build interim and final transcripts
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Update visible transcript with both final and interim
      const displayTranscript = finalTranscriptRef.current + interimTranscript;
      setTranscript(displayTranscript);

      // Call onResult only when there's new final content
      if (options.onResult && finalTranscriptRef.current.trim()) {
        options.onResult(finalTranscriptRef.current.trim());
      }
    };

    recognitionRef.current.start();
  }, [options]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      // Send final transcript on stop
      if (options.onResult && finalTranscriptRef.current.trim()) {
        options.onResult(finalTranscriptRef.current.trim());
      }
    }
  }, [options]);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening
  };
};
