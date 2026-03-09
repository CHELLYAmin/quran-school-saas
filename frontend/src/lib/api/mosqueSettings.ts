import apiClient from './client';

export interface MosqueSettings {
    id: string;
    latitude: number;
    longitude: number;
    address: string;
    calculationMethod: number;
    prayersJson: string;
}

export interface UpdateMosqueSettingsDto {
    latitude: number;
    longitude: number;
    address: string;
    calculationMethod: number;
    prayersJson: string;
}

export const fetchMosqueSettings = async (): Promise<MosqueSettings> => {
    const response = await apiClient.get<MosqueSettings>('/api/MosqueSettings');
    return response.data;
};

export const saveMosqueSettings = async (settings: UpdateMosqueSettingsDto): Promise<MosqueSettings> => {
    const response = await apiClient.post<MosqueSettings>('/api/MosqueSettings', settings);
    return response.data;
};
