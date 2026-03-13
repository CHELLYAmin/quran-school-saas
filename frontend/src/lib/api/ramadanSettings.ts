import apiClient from './client';

export interface RamadanSettingsDto {
    id?: string;
    year: number;
    firstDay: string;
    isVisible: boolean;
    calendarJson: string;
}

export const fetchRamadanSettings = async (): Promise<RamadanSettingsDto | null> => {
    try {
        const response = await apiClient.get<RamadanSettingsDto>('/api/RamadanSettings');
        return response.data;
    } catch {
        return null;
    }
};

export const saveRamadanSettings = async (settings: RamadanSettingsDto): Promise<RamadanSettingsDto> => {
    const response = await apiClient.post<RamadanSettingsDto>('/api/RamadanSettings', settings);
    return response.data;
};

export const ramadanApi = {
    getSettings: () => apiClient.get<RamadanSettingsDto>('/api/RamadanSettings'),
    saveSettings: (settings: RamadanSettingsDto) => apiClient.post<RamadanSettingsDto>('/api/RamadanSettings', settings)
};
