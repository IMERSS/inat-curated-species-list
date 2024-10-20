export const invertObj = (data) => Object.fromEntries(Object.entries(data).map(([key, value]) => [value, key]));
