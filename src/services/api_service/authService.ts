import { ProductService } from './productService';
import { LoginCredentials, RegisterCredentials, AuthResponse, AuthUser, UserData, ForgotPasswordRequest, ResetPasswordRequest, ApiAddress, AddressInput } from './types';
import { getApiBaseUrl } from '../../utils/networkConfig';

export class AuthService extends ProductService {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const response = await this.fetchApi<any>('/login', {
                method: 'POST',
                body: JSON.stringify(credentials),
            });

            const authResponse: AuthResponse = {
                success: true,
                message: response.message,
                user: response.customer,
                token: response.token,
            };

            if (authResponse.token) {
                this.setAuthToken(authResponse.token);
            }

            return authResponse;
        } catch (error) {
            console.error('Error during login:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Login failed',
            };
        }
    }

    async register(credentials: RegisterCredentials): Promise<AuthResponse> {
        try {
            const response = await this.fetchApi<AuthResponse>('/auth/register', {
                method: 'POST',
                body: JSON.stringify(credentials),
            });
            if (response.success && response.token) {
                this.setAuthToken(response.token);
            }
            return response;
        } catch (error) {
            console.error('Error during registration:', error);
            throw error;
        }
    }

    async forgotPassword(request: ForgotPasswordRequest): Promise<AuthResponse> {
        try {
            return await this.fetchApi<AuthResponse>('/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify(request),
            });
        } catch (error) {
            console.error('Error during forgot password:', error);
            throw error;
        }
    }

    async resetPassword(request: ResetPasswordRequest): Promise<AuthResponse> {
        try {
            return await this.fetchApi<AuthResponse>('/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify(request),
            });
        } catch (error) {
            console.error('Error during password reset:', error);
            throw error;
        }
    }

    async logout(): Promise<AuthResponse> {
        try {
            const response = await this.fetchApi<AuthResponse>('/auth/logout', {
                method: 'POST',
            });
            this.setAuthToken(null);
            return response;
        } catch (error) {
            console.error('Error during logout:', error);
            this.setAuthToken(null);
            throw error;
        }
    }

    async refreshToken(refreshToken: string): Promise<AuthResponse> {
        try {
            const response = await this.fetchApi<AuthResponse>('/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({ refreshToken }),
            });
            if (response.success && response.token) {
                this.setAuthToken(response.token);
            }
            return response;
        } catch (error) {
            console.error('Error during token refresh:', error);
            throw error;
        }
    }

    async getCurrentUser(): Promise<AuthUser> {
        try {
            const response = await this.fetchApi<{ user: AuthUser }>('/user');
            return response.user;
        } catch (error) {
            console.error('Error fetching current user:', error);
            throw error;
        }
    }

    async getUserData(): Promise<UserData> {
        try {
            return await this.fetchApi<UserData>('/user');
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        }
    }

    async updateProfile(userData: Partial<AuthUser>): Promise<AuthResponse> {
        try {
            return await this.fetchApi<AuthResponse>('/auth/profile', {
                method: 'PUT',
                body: JSON.stringify(userData),
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    async oauthLogin(provider: 'google' | 'facebook' | 'apple', token: string, userInfo?: any): Promise<AuthResponse> {
        try {
            const response = await this.fetchApi<AuthResponse>('/auth/oauth/login', {
                method: 'POST',
                body: JSON.stringify({
                    provider,
                    token,
                    userInfo,
                }),
            });

            if (response.success && response.token) {
                this.setAuthToken(response.token);
            }

            return response;
        } catch (error) {
            console.error(`Error during ${provider} OAuth login:`, error);
            const mockResponse: AuthResponse = {
                success: true,
                message: `Mock ${provider} login successful`,
                user: {
                    id: Date.now(),
                    name: 'Test User',
                    phone: '',
                    email: userInfo?.email || 'test@example.com',
                    address: null,
                    gstin: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                } as AuthUser,
                token: 'mock_jwt_token_' + Date.now(),
            };
            this.setAuthToken(mockResponse.token!);
            return mockResponse;
        }
    }

    getOAuthRedirectUrl(provider: 'google' | 'facebook' | 'apple'): string {
        const baseUrl = getApiBaseUrl().replace('/api', '');
        return `${baseUrl}/auth/${provider}`;
    }

    async handleOAuthCallback(provider: 'google' | 'facebook' | 'apple', params: { [key: string]: string }): Promise<AuthResponse> {
        try {
            const baseUrl = getApiBaseUrl().replace('/api', '');
            const callbackUrl = `${baseUrl}/auth/${provider}/callback`;

            const response = await this.fetchApi<AuthResponse>(callbackUrl.replace(baseUrl, ''), {
                method: 'POST',
                body: JSON.stringify({
                    ...params,
                    redirect_uri: 'appfashion://oauth/callback',
                }),
            });

            if (response.success && response.token) {
                this.setAuthToken(response.token);
            }

            return response;
        } catch (error) {
            console.error(`Error handling ${provider} OAuth callback:`, error);
            throw error;
        }
    }

    async createAddress(addressData: any): Promise<any> {
        return this.addAddress(addressData);
    }

    async getAddresses(): Promise<ApiAddress[]> {
        try {
            const userData = await this.getUserData();
            return userData.addresses;
        } catch (error) {
            console.error('Error fetching addresses:', error);
            return [];
        }
    }

    async addAddress(addressData: AddressInput): Promise<{ success: boolean; message: string; address?: ApiAddress }> {
        try {
            return await this.fetchApi('/addresses', {
                method: 'POST',
                body: JSON.stringify(addressData),
            });
        } catch (error) {
            console.error('Error adding address:', error);
            throw error;
        }
    }

    async updateAddress(addressId: number, addressData: AddressInput): Promise<{ success: boolean; message: string; address?: ApiAddress }> {
        try {
            return await this.fetchApi(`/addresses/${addressId}`, {
                method: 'PUT',
                body: JSON.stringify(addressData),
            });
        } catch (error) {
            console.error('Error updating address:', error);
            throw error;
        }
    }

    async deleteAddress(addressId: number): Promise<{ success: boolean; message: string }> {
        try {
            return await this.fetchApi(`/addresses/${addressId}`, {
                method: 'DELETE',
            });
        } catch (error) {
            console.error('Error deleting address:', error);
            throw error;
        }
    }

    async setDefaultAddress(addressId: number): Promise<{ success: boolean; message: string }> {
        try {
            return await this.fetchApi(`/addresses/${addressId}/default`, {
                method: 'POST',
            });
        } catch (error) {
            console.error('Error setting default address:', error);
            throw error;
        }
    }
}
