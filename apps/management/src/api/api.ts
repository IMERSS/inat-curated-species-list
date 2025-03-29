import { API_PORT } from '../constants';

export const getApiUrl = (path: string) => {
  return `http://localhost:${API_PORT}/${path}`;
};

export const getMainConfig = () => {
  return fetch(getApiUrl('backup-settings'));
};

export const updateMainConfig = (content: any) => {
  return fetch(getApiUrl('backup-settings'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(content),
  });
};

export const getMainSettings = () => {
  return fetch(getApiUrl('main-settings'));
};

export const updateMainSettings = (content: any) => {
  return fetch(getApiUrl('main-settings'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(content),
  });
};

export const getBaselineSpecies = () => {
  return fetch(getApiUrl('baseline-species'));
};

export const updateBaselineSpecies = (content: any) => {
  return fetch(getApiUrl('baseline-species'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(content),
  });
};
