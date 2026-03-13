import apiClient from './client';

export interface RamadanSettingsDto {
    id?: string;
    year: number;
    firstDay: string;
    isVisible: boolean;
    calendarJson: string;
}

export const ramadanApi = {
    getSettings: () => apiClient.get<RamadanSettingsDto>('/api/RamadanSettings'),
    saveSettings: (settings: RamadanSettingsDto) => apiClient.post<RamadanSettingsDto>('/api/RamadanSettings', settings)
};
