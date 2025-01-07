import { NewAddition } from '@imerss/inat-curated-species-list-tools';
import { NewAdditionsByYear } from '../ui.types';

export const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const getNewAdditionDataForUI = (data: NewAddition[]) => {
  const groupedByYear: NewAdditionsByYear = {};
  data.forEach((row) => {
    const { confirmationDate } = row;
    const year = new Date(confirmationDate).getFullYear();

    if (!groupedByYear[year]) {
      groupedByYear[year] = [];
    }

    groupedByYear[year].push(row);
  });

  const years = Object.keys(groupedByYear);

  if (!years.length) {
    return {
      years: [],
      groupedByYear: {},
    };
  }

  const yearsWithNewAdditions = years.sort();
  const currentYear = new Date().getFullYear();
  const earliestYear = parseInt(yearsWithNewAdditions[0] as string);

  const yearArray = [];
  for (let i = earliestYear; i <= currentYear; i++) {
    yearArray.push(i.toString());
  }

  return {
    currentYear,
    years: yearArray,
    groupedByYear,
  };
};
