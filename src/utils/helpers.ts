import { nanoid } from 'nanoid';

export const invertObj = (data: object) => Object.fromEntries(Object.entries(data).map(([key, value]) => [value, key]));
export const formatNum = (num: number) => new Intl.NumberFormat('en-US').format(num);
export const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

type Keys = {
  [key: string]: boolean;
};

const generatedKeys: Keys = {};
let currKeyLength = 1;

/**
 * Helper method used for data minimization. It returns a short unique key.
 */
export const getShortestUniqueKey: () => string = () => {
  let key = '';
  for (let i = 0; i < 20; i++) {
    const currKey = nanoid(currKeyLength);
    if (!generatedKeys[currKey]) {
      key = currKey;
      generatedKeys[currKey] = true;
      break;
    }
  }
  if (key) {
    return key;
  }
  currKeyLength++;

  return getShortestUniqueKey();
};
