import { useRef, useEffect } from 'react';
import { Keyboard, Platform, Animated } from 'react-native';

export function useKeyboardAnimation(bottomInset: number) {
    const keyboardHeight = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const showSub = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                const height = Platform.OS === 'android' 
                    ? e.endCoordinates.height - bottomInset - 32
                    : e.endCoordinates.height;
                Animated.timing(keyboardHeight, {
                    toValue: Math.max(0, height),
                    duration: Platform.OS === 'ios' ? 250 : 50,
                    useNativeDriver: false,
                }).start();
            }
        );
        const hideSub = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                Animated.timing(keyboardHeight, {
                    toValue: 0,
                    duration: Platform.OS === 'ios' ? 250 : 50,
                    useNativeDriver: false,
                }).start();
            }
        );
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, [bottomInset, keyboardHeight]);

    return keyboardHeight;
}
