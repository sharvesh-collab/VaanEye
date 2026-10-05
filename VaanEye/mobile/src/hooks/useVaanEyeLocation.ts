import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

export function useVaanEyeLocation() {
    const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                await fallbackToLastLocation();
                setIsLoading(false);
                return;
            }

            try {
                // Use Balanced accuracy for speed and offline resiliency
                let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
                setLocation(coords);
                await AsyncStorage.setItem('@last_location', JSON.stringify(coords));
            } catch (err) {
                console.warn('GPS Fetch failed, using fallback:', err);
                await fallbackToLastLocation();
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const fallbackToLastLocation = async () => {
        try {
            const last = await AsyncStorage.getItem('@last_location');
            if (last) {
                setLocation(JSON.parse(last));
            } else {
                // Fallback to Kinatukadavu if nothing is cached
                setLocation({ latitude: 10.80, longitude: 76.99 });
            }
        } catch(e) {
            setLocation({ latitude: 10.80, longitude: 76.99 });
        }
    };

    return { location, errorMsg, isLoading };
}
