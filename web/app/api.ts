// api
import { FileFolder } from './types';

const API_URL = 'http://localhost:3000';

export const getSection = async (section: string): Promise<FileFolder[]> => {
    const res = await fetch(`${API_URL}/getSection/${section}`);
    const json = await res.json();
    return json;
};

export const getFolder = async (folderID: string): Promise<FileFolder[]> => {
    const res = await fetch(`${API_URL}/getFolder/${folderID}`);
    const json = await res.json();
    return json;
}