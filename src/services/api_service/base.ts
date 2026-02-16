// Base API Service for AppFashion
import { getApiBaseUrl, API_CONFIG } from '../../utils/networkConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = getApiBaseUrl();

export class ApiService {
    protected authToken: string | null = null;
    protected guestSessionToken: string | null = null;

    // Set authentication token for API requests
    setAuthToken(token: string | null) {
        this.authToken = token;
    }

    // Get current auth token
    getAuthToken(): string | null {
        return this.authToken;
    }

    // Generate guest session token
    private generateGuestSessionToken(): string {
        return Math.random().toString(36).slice(2) + Date.now().toString(36);
    }

    // Get or generate session token for guest API calls
    public async getSessionToken(): Promise<string> {
        if (this.guestSessionToken) {
            return this.guestSessionToken;
        }

        try {
            const storedToken = await AsyncStorage.getItem('guest_session_token');
            if (storedToken) {
                this.guestSessionToken = storedToken;
                return storedToken;
            }
        } catch (error) {
            console.warn('Error reading guest token from storage:', error);
        }

        this.guestSessionToken = this.generateGuestSessionToken();
        try {
            await AsyncStorage.setItem('guest_session_token', this.guestSessionToken);
        } catch (error) {
            console.warn('Error saving guest token to storage:', error);
        }

        return this.guestSessionToken;
    }

    protected async fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        try {
            if (__DEV__) {
                console.log(`📡 [API] ${options.method || 'GET'} ${BASE_URL}${endpoint}`);
                if (options.body) console.log(`📦 [Body]`, options.body);
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

            const optionsHeaders = options.headers instanceof Headers
                ? Object.fromEntries(options.headers.entries())
                : (options.headers as Record<string, string> | undefined) || {};

            const headers: Record<string, string> = {
                ...API_CONFIG.HEADERS,
                ...optionsHeaders,
            };

            if (this.authToken && !headers['Authorization']) {
                headers['Authorization'] = `Bearer ${this.authToken}`;
            }

            const response = await fetch(`${BASE_URL}${endpoint}`, {
                headers,
                signal: controller.signal,
                ...options,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                let errorDetails = '';
                try {
                    const errorText = await response.text();
                    console.error(`🚨 API Error Details (${response.status} ${response.statusText}):`, {
                        url: `${BASE_URL}${endpoint}`,
                        method: options.method || 'GET',
                        responseBody: errorText.substring(0, 500),
                    });

                    try {
                        const errorJson = JSON.parse(errorText);
                        errorDetails = errorJson.message || errorJson.error || errorText;
                    } catch {
                        errorDetails = errorText;
                    }
                } catch (textError) {
                    errorDetails = `HTTP ${response.status}`;
                }

                throw new Error(`HTTP ${response.status}: ${errorDetails}`);
            }

            const responseText = await response.text();

            try {
                return JSON.parse(responseText);
            } catch (parseError) {
                console.error('🚨 JSON Parse Error:', {
                    url: `${BASE_URL}${endpoint}`,
                    responseStart: responseText.substring(0, 200),
                    parseError: parseError
                });
                throw new Error(`Invalid JSON response from ${endpoint}`);
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                const isTimeout = !options.signal || (error instanceof Error && error.message.includes('timeout'));
                const reason = isTimeout ? 'Request Timed Out' : 'Request Aborted';
                console.error(`🚨 [API ${reason}] for ${options.method || 'GET'} ${BASE_URL}${endpoint} after ${API_CONFIG.TIMEOUT}ms`);
                throw new Error(`${reason}. Please check your connection.`);
            }

            console.error(`🚨 API Error for ${endpoint}:`, error);
            throw error;
        }
    }
}
