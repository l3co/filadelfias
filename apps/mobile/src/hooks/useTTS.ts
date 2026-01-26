import { useState, useCallback, useRef } from 'react';
import * as Speech from 'expo-speech';

export function useTTS() {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentVerseIndex, setCurrentVerseIndex] = useState<number | null>(null);
    const versesRef = useRef<string[]>([]);
    const currentIndexRef = useRef(0);

    const speak = useCallback((verses: string[], startIndex = 0) => {
        if (isSpeaking) {
            Speech.stop();
            setIsSpeaking(false);
            setCurrentVerseIndex(null);
            return;
        }

        versesRef.current = verses;
        currentIndexRef.current = startIndex;

        const speakNext = () => {
            if (currentIndexRef.current >= versesRef.current.length) {
                setIsSpeaking(false);
                setCurrentVerseIndex(null);
                return;
            }

            const verse = versesRef.current[currentIndexRef.current];
            setCurrentVerseIndex(currentIndexRef.current);

            Speech.speak(verse, {
                language: 'pt-BR',
                rate: 0.9,
                onDone: () => {
                    currentIndexRef.current += 1;
                    speakNext();
                },
                onStopped: () => {
                    setIsSpeaking(false);
                    setCurrentVerseIndex(null);
                },
                onError: () => {
                    setIsSpeaking(false);
                    setCurrentVerseIndex(null);
                },
            });
        };

        setIsSpeaking(true);
        speakNext();
    }, [isSpeaking]);

    const stop = useCallback(() => {
        Speech.stop();
        setIsSpeaking(false);
        setCurrentVerseIndex(null);
    }, []);

    const pause = useCallback(() => {
        Speech.stop();
        setIsSpeaking(false);
    }, []);

    return {
        isSpeaking,
        currentVerseIndex,
        speak,
        stop,
        pause,
    };
}
