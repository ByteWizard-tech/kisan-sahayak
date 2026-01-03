import { useState, useEffect, useCallback } from 'react';
import { Language } from './types';

export const useVoiceInput = (language: Language) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Map App Language to BCP 47 Language Tag
  const getLangCode = (lang: Language) => {
    switch (lang) {
      case Language.HINDI: return 'hi-IN';
      case Language.TAMIL: return 'ta-IN';
      default: return 'en-IN';
    }
  };

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError("Voice input not supported in this browser.");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = getLangCode(language);

    recognition.onstart = () => setIsListening(true);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  }, [language]);

  const resetTranscript = () => setTranscript('');

  return { isListening, transcript, startListening, resetTranscript, error };
};