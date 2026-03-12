import apiClient from './client';

export interface CmsPage {
    id: string;
    title: string;
    slug: string;
    content: string;
    category: string;
    isPublished: boolean;
    showInMenu: boolean;
    sortOrder: number;
    parentSlug?: string;
    featuredImageUrl?: string;
    excerpt?: string;
    seoTitle?: string;
    seoDescription?: string;
    metaImage?: string;
    icon?: string;
    blocksJson?: string;
    isSystemPage?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCmsPageDto {
    title: string;
    slug: string;
    content: string;
    category: string;
    isPublished?: boolean;
    showInMenu?: boolean;
    sortOrder?: number;
    parentSlug?: string;
    featuredImageUrl?: string;
    excerpt?: string;
    seoTitle?: string;
    seoDescription?: string;
    metaImage?: string;
    icon?: string;
    blocksJson?: string;
    isSystemPage?: boolean;
}

export interface UpdateCmsPageDto extends CreateCmsPageDto { }

export const cmsApi = {
    getPages: (published?: boolean, category?: string) => {
        const params = new URLSearchParams();
        if (published !== undefined) params.append('published', published.toString());
        if (category) params.append('category', category);
        return apiClient.get<CmsPage[]>(`/api/cms/pages?${params.toString()}`);
    },
    getPageBySlug: (slug: string) => apiClient.get<CmsPage>(`/api/cms/pages/${slug}`),
    createPage: (data: CreateCmsPageDto) => apiClient.post<CmsPage>('/api/cms/pages', data),
    updatePage: (id: string, data: UpdateCmsPageDto) => apiClient.put<CmsPage>(`/api/cms/pages/${id}`, data),
    deletePage: (id: string) => apiClient.delete(`/api/cms/pages/${id}`),
    togglePublish: (id: string) => apiClient.patch<{ id: string; isPublished: boolean }>(`/api/cms/pages/${id}/publish`),
};
