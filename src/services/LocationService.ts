import Geolocation, { GeoPosition } from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';
import Geocoder from 'react-native-geocoding';

// Initialize Geocoder with your Google Maps API Key
// TODO: Replace with your actual API Key or user config
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';
Geocoder.init(GOOGLE_MAPS_API_KEY);

export interface LocationData {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
}

class LocationService {
    /**
     * Request location permissions
     */
    async requestPermissions(): Promise<boolean> {
        if (Platform.OS === 'ios') {
            const auth = await Geolocation.requestAuthorization('whenInUse');
            return auth === 'granted';
        }

        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Location Permission',
                        message: 'AppFashion needs access to your location to set your delivery address.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }

        return false;
    }

    /**
     * Get current device location
     */
    getCurrentLocation(): Promise<GeoPosition> {
        return new Promise((resolve, reject) => {
            this.requestPermissions().then((hasPermission) => {
                if (!hasPermission) {
                    reject(new Error('Location permission denied'));
                    return;
                }

                Geolocation.getCurrentPosition(
                    (position) => {
                        resolve(position);
                    },
                    (error) => {
                        console.error(error.code, error.message);
                        reject(error);
                    },
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
                );
            });
        });
    }

    /**
     * Get address from coordinates (Reverse Geocoding)
     */
    async getAddressFromCoordinates(latitude: number, longitude: number): Promise<LocationData> {
        try {
            // Check if API Key is set
            if (GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
                console.warn("Google Maps API Key not set. Returning coordinates only.");
                return { latitude, longitude, address: 'API Key Missing' };
            }

            const json = await Geocoder.from(latitude, longitude);
            if (json.results.length > 0) {
                const result = json.results[0];
                const addressComponent = result.address_components;

                // Extract details
                const getComponent = (type: string) =>
                    addressComponent.find(c => c.types.includes(type))?.long_name || '';

                return {
                    latitude,
                    longitude,
                    address: result.formatted_address,
                    city: getComponent('locality') || getComponent('administrative_area_level_2'),
                    state: getComponent('administrative_area_level_1'),
                    pincode: getComponent('postal_code'),
                };
            }

            return { latitude, longitude };
        } catch (error) {
            console.error('Geocoding error:', error);
            throw error;
        }
    }

    /**
     * Open location settings
     */
    openSettings() {
        Linking.openSettings();
    }
}

export const locationService = new LocationService();
