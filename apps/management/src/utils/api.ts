import { API_PORT } from '../constants';

export const getApiUrl = (path: string) => {
  return `http://localhost:${API_PORT}/${path}`;
};

export const getMainConfig = () => {
  return fetch(getApiUrl('main-config'));
};

export const updateMainConfig = (content: any) => {
  return fetch(getApiUrl('main-config'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(content),
  });
};
