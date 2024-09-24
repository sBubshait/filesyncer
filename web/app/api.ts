// api
import { FileFolder } from './types';

const API_URL = 'http://localhost:3000';

export const getSection = async (section: string): Promise<FileFolder[]> => {
    const res = await fetch(`${API_URL}/getSection/${section}`, {cache: "no-store"});
    const json = await res.json();
    return json;
};

export const getFolder = async (folderID: string): Promise<{ name: string, files: FileFolder[] }> => {
    const res = await fetch(`${API_URL}/getFolder/${folderID}`, {cache: "no-store"});
    const json = await res.json();
    console.log(json)
    return json;
}