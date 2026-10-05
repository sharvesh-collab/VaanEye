import { useState, useEffect } from 'react';
import * as Network from 'expo-network';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useVaanEyeWeather(location: {latitude: number, longitude: number} | null) {
    const [weather, setWeather] = useState<any>(null);
    const [isOfflineMode, setIsOfflineMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!location) return;

        (async () => {
            setIsLoading(true);
            try {
                const networkState = await Network.getNetworkStateAsync();
                
                if (networkState.isConnected && networkState.isInternetReachable !== false) {
                    try {
                        const apiUrl = \`https://api.open-meteo.com/v1/forecast?latitude=\${location.latitude}&longitude=\${location.longitude}&daily=sunrise,sunset,temperature_2m_min,temperature_2m_max,weather_code,precipitation_sum,precipitation_probability_max,uv_index_max&hourly=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,surface_pressure,visibility,wind_speed_10m,wind_gusts_10m,soil_temperature_0cm,soil_moisture_0_to_1cm&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_gusts_10m&timezone=auto\`;
                        const res = await fetch(apiUrl);
                        if (!res.ok) throw new Error('Network response was not ok');
                        const data = await res.json();
                        
                        setWeather(data);
                        setIsOfflineMode(false);
                        await AsyncStorage.setItem('@cached_weather', JSON.stringify(data));
                    } catch (err) {
                        console.warn('API Fetch failed, using cache:', err);
                        await loadCachedWeather();
                    }
                } else {
                    await loadCachedWeather();
                }
            } catch (err) {
                console.warn('Network check failed, using cache:', err);
                await loadCachedWeather();
            } finally {
                setIsLoading(false);
            }
        })();

        async function loadCachedWeather() {
            setIsOfflineMode(true);
            try {
                const cached = await AsyncStorage.getItem('@cached_weather');
                if (cached) {
                    setWeather(JSON.parse(cached));
                } else {
                    setWeather(null); // No cache available yet
                }
            } catch (e) {
                setWeather(null);
            }
        }
    }, [location]);

    return { weather, isOfflineMode, isLoading };
}
