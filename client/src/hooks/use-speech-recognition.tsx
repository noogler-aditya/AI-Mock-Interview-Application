import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechRecognitionOptions {
  silenceTimeout?: number; // milliseconds
  noiseThreshold?: number; // 0 to 1
  language?: string;
}

const DEFAULT_OPTIONS: SpeechRecognitionOptions = {
  silenceTimeout: 2000, // 2 seconds
  noiseThreshold: 0.1,
  language: 'en-US'
};

export function useSpeechRecognition(options: SpeechRecognitionOptions = {}) {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout>();
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Check browser support
  const isSpeechRecognitionSupported = useCallback(() => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }, []);

  // Reset silence timeout
  const resetSilenceTimeout = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    
    silenceTimeoutRef.current = setTimeout(() => {
      if (recognitionRef.current) {
        stopListening(recognitionRef.current);
      }
    }, opts.silenceTimeout);
  }, [opts.silenceTimeout]);

  const startListening = useCallback(() => {
    if (!isSpeechRecognitionSupported()) {
      setError(new Error('Speech recognition is not supported in this browser'));
      return null;
    }

    try {
      // Clean up any existing instance
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = opts.language;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setError(null);
        resetSilenceTimeout();
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current];
        const transcriptText = result[0].transcript;
        const confidence = result[0].confidence;
        
        // Filter out low confidence results
        if (confidence >= opts.noiseThreshold) {
          setTranscript(prev => {
            // Avoid duplicate text from interim results
            const newText = transcriptText.trim();
            if (!prev.endsWith(newText)) {
              return prev + ' ' + newText;
            }
            return prev;
          });
          resetSilenceTimeout();
        }
      };

      recognition.onerror = (event: any) => {
        const errorMessage = event.error === 'not-allowed' 
          ? 'Microphone access denied. Please enable microphone access and try again.'
          : `Speech recognition error: ${event.error}`;
        
        setError(new Error(errorMessage));
        setIsListening(false);
        
        // Try to restart on recoverable errors
        if (event.error === 'network' || event.error === 'service-not-allowed') {
          setTimeout(() => {
            if (recognitionRef.current === recognition) {
              startListening();
            }
          }, 1000);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // Clear silence timeout
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      return recognition;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to start speech recognition'));
      setIsListening(false);
      return null;
    }
  }, [opts.language, opts.noiseThreshold, resetSilenceTimeout, isSpeechRecognitionSupported]);

  const stopListening = useCallback((recognition: any) => {
    try {
      if (recognition) {
        recognition.stop();
      }
    } catch (err) {
      console.error('Error stopping speech recognition:', err);
    }
    
    setIsListening(false);
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        stopListening(recognitionRef.current);
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, [stopListening]);

  return {
    transcript,
    isListening,
    error,
    startListening,
    stopListening,
    isSupported: isSpeechRecognitionSupported(),
  };
}