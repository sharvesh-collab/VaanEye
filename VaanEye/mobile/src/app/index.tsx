import { Text, View, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useVaanEyeLocation } from '../hooks/useVaanEyeLocation';
import { useVaanEyeWeather } from '../hooks/useVaanEyeWeather';

export default function Index() {
  const { location, errorMsg, isLoading: isLocLoading } = useVaanEyeLocation();
  const { weather, isOfflineMode, isLoading: isWeatherLoading } = useVaanEyeWeather(location);

  return (
    <ScrollView style={styles.container}>
      {isOfflineMode && (
        <View style={styles.offlineBadge}>
          <Text style={styles.offlineText}>⚠️ Offline Mode - Showing Last Updated Data</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>VaanEye Mobile Dashboard</Text>
        {location ? (
          <Text style={styles.subtitle}>
            Lat: {location.latitude.toFixed(4)}, Lon: {location.longitude.toFixed(4)}
          </Text>
        ) : (
          <Text style={styles.subtitle}>Acquiring Location...</Text>
        )}
      </View>

      {(isLocLoading || isWeatherLoading) && !weather ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5b8cff" />
          <Text style={styles.loadingText}>Fetching Intelligence...</Text>
        </View>
      ) : (
        <View style={styles.weatherContainer}>
          {weather && weather.current ? (
            <>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>NORMAL WEATHER</Text>
                <View style={styles.row}>
                  <Text style={styles.metric}>{weather.current.temperature_2m}°C</Text>
                  <Text style={styles.metricSub}>Humidity: {weather.current.relative_humidity_2m}%</Text>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={[styles.cardTitle, { color: '#ff6b81' }]}>DISASTER RISK</Text>
                <View style={styles.row}>
                  <Text style={styles.metricSub}>Rainfall: {weather.current.precipitation} mm</Text>
                  <Text style={[styles.metricSub, { color: '#ffc53d' }]}>Gusts: {weather.current.wind_gusts_10m} km/h</Text>
                </View>
              </View>
            </>
          ) : (
             <Text style={styles.errorText}>No weather data available. Please connect to internet.</Text>
          )}

          {weather && weather.hourly && weather.hourly.soil_moisture_0_to_1cm && (
            <View style={styles.card}>
              <Text style={[styles.cardTitle, { color: '#3dd68c' }]}>AGRI INSIGHTS</Text>
              <View style={styles.row}>
                <Text style={styles.metricSub}>Soil Moisture:</Text>
                <Text style={[styles.metric, { color: '#a06bff', fontSize: 18 }]}>
                  {weather.hourly.soil_moisture_0_to_1cm[new Date().getHours()]} m³/m³
                </Text>
              </View>
            </View>
          )}
        </View>
      )}
      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05070f',
  },
  offlineBadge: {
    backgroundColor: '#ffc53d',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  header: {
    padding: 20,
    marginTop: 40,
  },
  title: {
    color: '#f3f6fc',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#8b98b4',
    fontSize: 14,
    marginTop: 5,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#8b98b4',
    marginTop: 10,
  },
  weatherContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardTitle: {
    color: '#8b98b4',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metric: {
    color: '#f3f6fc',
    fontSize: 24,
    fontWeight: 'bold',
  },
  metricSub: {
    color: '#1fd5e8',
    fontSize: 16,
  },
  errorText: {
    color: '#ff6b81',
    padding: 20,
    textAlign: 'center',
  }
});
