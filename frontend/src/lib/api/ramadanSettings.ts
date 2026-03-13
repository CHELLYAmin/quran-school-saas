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
        const response = await apiClient.get('/api/RamadanSettings');
        return response.data;
    } catch (error) {
        console.error('Error fetching Ramadan settings:', error);
        return null;
    }
};

export const saveRamadanSettings = async (settings: RamadanSettingsDto): Promise<RamadanSettingsDto> => {
    const response = await apiClient.post('/api/RamadanSettings', settings);
    return response.data;
};
