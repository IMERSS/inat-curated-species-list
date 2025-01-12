import { format } from 'date-fns';
import { NewAddition } from '@imerss/inat-curated-species-list-tools';
import { NewAdditionsByYear } from '../ui.types';

export const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export type NewAdditionsUIData = {
  readonly currentYear: string;
  readonly years: string[];
  readonly groupedByYear: NewAdditionsByYear;
};

export const getNewAdditionDataForUI = (data: NewAddition[]): NewAdditionsUIData => {
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
  const currentYear = new Date().getFullYear();

  if (!years.length) {
    return {
      currentYear: currentYear.toString(),
      years: [],
      groupedByYear: {},
    };
  }

  const yearsWithNewAdditions = years.sort();
  const earliestYear = parseInt(yearsWithNewAdditions[0] as string);

  const yearArray = [];
  for (let i = earliestYear; i <= currentYear; i++) {
    yearArray.push(i.toString());
  }

  return {
    currentYear: currentYear.toString(),
    years: yearArray,
    groupedByYear,
  };
};

export const formatDate = (date: string) => format(new Date(date), 'MMM d, yyyy');
