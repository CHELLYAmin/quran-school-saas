import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface RamadanSettingsDto {
    id?: string;
    year: number;
    firstDay: string;
    isVisible: boolean;
    calendarJson: string;
}

export const fetchRamadanSettings = async (): Promise<RamadanSettingsDto | null> => {
    try {
        const response = await axios.get(`${API_URL}/api/RamadanSettings`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching Ramadan settings:', error);
        return null;
    }
};

export const saveRamadanSettings = async (settings: RamadanSettingsDto): Promise<RamadanSettingsDto> => {
    const response = await axios.post(`${API_URL}/api/RamadanSettings`, settings, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};
