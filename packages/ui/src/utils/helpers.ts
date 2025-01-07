import { NewAddition } from '@imerss/inat-curated-species-list-tools';
import { NewAdditionsByYear } from '../ui.types';

export const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const groupByYear = (data: NewAddition[]): NewAdditionsByYear => {
  const groupedByYear: NewAdditionsByYear = {};
  data.forEach((row) => {
    const { confirmationDate } = row;
    const year = new Date(confirmationDate).getFullYear();

    if (!groupedByYear[year]) {
      groupedByYear[year] = [];
    }

    groupedByYear[year].push(row);
  });

  return groupedByYear;
};
