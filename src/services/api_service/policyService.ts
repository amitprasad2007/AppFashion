import { OrderService } from './orderService';
import { ApiPolicy, ApiProduct } from './types';
import { getApiBaseUrl } from '../../utils/networkConfig';

export class PolicyService extends OrderService {
    async getPolicies(): Promise<ApiPolicy[]> {
        try {
            return await this.fetchApi<ApiPolicy[]>('/policies');
        } catch (error) {
            console.error('Error fetching policies:', error);
            return [];
        }
    }

    async getPolicyBySlug(slug: string): Promise<ApiPolicy | null> {
        try {
            return await this.fetchApi<ApiPolicy>(`/policies/${slug}`);
        } catch (error) {
            console.error(`Error fetching policy ${slug}:`, error);
            return null;
        }
    }

    async getRecommendedProducts(): Promise<ApiProduct[]> {
        try {
            return await this.fetchApi<ApiProduct[]>('/recommended-products');
        } catch (error) {
            console.error('Error fetching recommended products:', error);
            return [];
        }
    }

    getOAuthRedirectUrl(provider: string): string {
        const baseUrl = getApiBaseUrl().replace('/api', '');
        return `${baseUrl}/auth/${provider}`;
    }

    async getPolicy(type: string): Promise<ApiPolicy> {
        try {
            const response = await this.fetchApi<any>(`/policies/${type}`);
            let policyData = response?.data || response;
            if (!policyData || !policyData.metadata) throw new Error('Invalid policy data');
            return policyData;
        } catch (error) {
            console.error(`Error fetching policy ${type}:`, error);
            // Minimal mock data for fallback
            return {
                title: type.toUpperCase(),
                content: null,
                metadata: { introduction: `Details for ${type} policy`, sections: [] }
            };
        }
    }
}
