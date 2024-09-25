import { FileFolder } from '../types';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

export const API_URL = 'http://localhost:3000';
const secret = process.env.NEXTAUTH_SECRET;

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = Cookies.get('token');

  const authOptions = {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`, 
    },
  };

  const res = await fetch(url, authOptions);
  return res;
};

export const getSection = async (section: string): Promise<FileFolder[]> => {
    const res = await fetchWithAuth(`${API_URL}/getSection/${section}`, {cache: "no-store"});
    console.log(res.headers);
    const json = await res.json();
    return json;
};

export const getFolder = async (folderID: string): Promise<{ name: string, files: FileFolder[] }> => {
    const res = await fetchWithAuth(`${API_URL}/getFolder/${folderID}`, {cache: "no-store"});
    const json = await res.json();
    console.log(json)
    return json;
}

export const searchFiles = async (query: string): Promise<FileFolder[]> => {
    const res = await fetchWithAuth(`${API_URL}/search?query=${encodeURIComponent(query)}`, {cache: "no-store"});
    const json = await res.json();
    return json;
};