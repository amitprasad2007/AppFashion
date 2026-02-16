// Product-related API methods
import { ApiService } from './base';
import { ApiBannerData, ApiCategory, ApiProduct, ApiProductReview, ApiCollection, ApiSearchSuggestion, ProductSearchParams } from './types';

export class ProductService extends ApiService {
    async getBanners(): Promise<ApiBannerData[]> {
        try {
            const response = await this.fetchApi<ApiBannerData[]>('/getBanners');
            return Array.isArray(response) ? response : [];
        } catch (error) {
            console.error('Error fetching banners:', error);
            return [
                {
                    id: 1,
                    title: "New Collection",
                    subtitle: "Discover Latest Fashion",
                    description: "Explore our stunning new arrivals",
                    image: "https://via.placeholder.com/400x200/f43f5e/ffffff?text=New+Collection",
                    cta: "Shop Now",
                    path: "/categories"
                },
                {
                    id: 2,
                    title: "Special Offer",
                    subtitle: "Up to 50% Off",
                    description: "Limited time discount on selected items",
                    image: "https://via.placeholder.com/400x200/8b5cf6/ffffff?text=Special+Offer",
                    cta: "Get Discount",
                    path: "/products"
                }
            ];
        }
    }

    async getCategories(): Promise<ApiCategory[]> {
        try {
            const response = await this.fetchApi<ApiCategory[]>('/categories');
            if (Array.isArray(response)) return response;
            if (response && (response as any).data) return (response as any).data;
            return [];
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    }

    async getCategoryProducts(categoryId: number): Promise<ApiProduct[]> {
        try {
            const response = await this.fetchApi<ApiProduct[]>(`/products/${categoryId}`);
            if (Array.isArray(response)) return response;
            if (response && (response as any).data) return (response as any).data;
            return [];
        } catch (error) {
            console.error('Error fetching categories products:', error);
            return [];
        }
    }

    async getBestsellerProducts(): Promise<ApiProduct[]> {
        try {
            const response = await this.fetchApi<ApiProduct[]>('/bestseller-products');
            if (Array.isArray(response)) return response;
            if (response && (response as any).data) return (response as any).data;
            return [];
        } catch (error) {
            console.error('Error fetching bestseller products:', error);
            return [];
        }
    }

    async getFeaturedProducts(): Promise<ApiProduct[]> {
        try {
            const response = await this.fetchApi<ApiProduct[]>('/featured-products');
            if (Array.isArray(response)) return response;
            if (response && (response as any).data) return (response as any).data;
            return [];
        } catch (error) {
            console.error('Error fetching featured products:', error);
            return [];
        }
    }

    async getProducts(params: ProductSearchParams = {}): Promise<ApiProduct[]> {
        try {
            if (params.categoryId) {
                return await this.getCategoryProducts(Number(params.categoryId));
            }
            if (params.type === 'featured') {
                return await this.getFeaturedProducts();
            }
            if (params.type === 'bestseller') {
                return await this.getBestsellerProducts();
            }
            // Default to featured if no specific params
            return await this.getFeaturedProducts();
        } catch (error) {
            console.error('Error in getProducts:', error);
            return [];
        }
    }

    async getRelatedProducts(productSlug: string): Promise<ApiProduct[]> {
        try {
            const response = await this.fetchApi<ApiProduct[]>(`/getRelatedProducts/${productSlug}`);
            return Array.isArray(response) ? response : (response as any)?.data || [];
        } catch (error) {
            console.error(`Error fetching related products for ${productSlug}:`, error);
            return [];
        }
    }

    async getProductBySlug(productSlug: string): Promise<ApiProduct | null> {
        try {
            return await this.fetchApi<ApiProduct>(`/getProductDetails/${productSlug}`);
        } catch (error) {
            console.error(`Error fetching product ${productSlug}:`, error);
            return null;
        }
    }

    async searchProducts(query: string, filters: any = {}): Promise<ApiProduct[]> {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('q', query);
            if (filters.category) queryParams.append('category', filters.category);
            if (filters.minPrice) queryParams.append('min_price', filters.minPrice.toString());
            if (filters.maxPrice) queryParams.append('max_price', filters.maxPrice.toString());
            if (filters.rating) queryParams.append('rating', filters.rating.toString());

            const response = await this.fetchApi<ApiProduct[]>(`/search?${queryParams.toString()}`);
            return Array.isArray(response) ? response : (response as any)?.data || [];
        } catch (error) {
            console.error('Error searching products:', error);
            return [];
        }
    }

    async getFeaturedCollections(): Promise<ApiCollection[]> {
        try {
            const response = await this.fetchApi<ApiCollection[]>('/featured-collections');
            return Array.isArray(response) ? response : (response as any)?.data || [];
        } catch (error) {
            console.error('Error fetching featured collections:', error);
            return [];
        }
    }

    async getAllCollections(): Promise<ApiCollection[]> {
        try {
            const response = await this.fetchApi<ApiCollection[]>('/collections');
            return Array.isArray(response) ? response : (response as any)?.data || [];
        } catch (error) {
            console.error('Error fetching all collections:', error);
            return [];
        }
    }

    async getCollectionBySlug(slug: string): Promise<ApiCollection | null> {
        try {
            const response = await fetch(`https://superadmin.samarsilkpalace.com/api/collections/${slug}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching collection by slug:', error);
            return null;
        }
    }

    async getCollectionTypes(): Promise<any[]> {
        try {
            const response = await fetch('https://superadmin.samarsilkpalace.com/api/collection-types');
            return await response.json();
        } catch (error) {
            console.error('Error fetching collection types:', error);
            return [];
        }
    }

    async getRecommendedProducts(): Promise<ApiProduct[]> {
        try {
            const response = await this.fetchApi<ApiProduct[]>('/recommended-products');
            return response || [];
        } catch (error) {
            console.error('Error fetching recommended products:', error);
            return [];
        }
    }

    async getSearchSuggestions(query: string): Promise<ApiSearchSuggestion[]> {
        try {
            const response = await this.fetchApi<ApiSearchSuggestion[]>(`/search/suggestions?q=${encodeURIComponent(query)}`);
            return Array.isArray(response) ? response : (response as any)?.data || [];
        } catch (error) {
            console.error('Error fetching search suggestions:', error);
            return [];
        }
    }

    async getProductReviews(productSlug: string): Promise<ApiProductReview[]> {
        try {
            const data = await this.fetchApi<{ data: ApiProductReview[] }>(`/product-reviews?productSlug=${encodeURIComponent(productSlug)}`);
            return (data && Array.isArray(data.data)) ? data.data : [];
        } catch (error) {
            console.error('Error fetching product reviews:', error);
            return [];
        }
    }

    async addProductReview(data: any): Promise<any> {
        try {
            return await this.fetchApi('/product-reviews', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        } catch (error) {
            console.error('Error adding product review:', error);
            throw error;
        }
    }
}
