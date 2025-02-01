import React, { FC } from 'react';
import { YearDropdown } from './YearDropdown';

interface YearNavigationProps {
  readonly currentYear: string;
  readonly years: string[];
  readonly onChange: (year: string) => void;
}

export const YearNavigation: FC<YearNavigationProps> = ({ currentYear, years, onChange }) => {
  const currentYearIndex = years.indexOf(currentYear);
  const earlierYearDisabled = currentYearIndex === years.length - 1;
  const laterYearDisabled = currentYearIndex === 0;

  const onNavigate = (direction: 'later' | 'earlier') => {
    const newIndex = direction === 'later' ? currentYearIndex - 1 : currentYearIndex + 1;
    onChange(years[newIndex] as string);
  };

  return (
    <div className="icsl-year-filter">
      <label>View by year:</label>
      <div>
        <button disabled={earlierYearDisabled} onClick={() => onNavigate('earlier')}>
          &laquo;
        </button>
        <YearDropdown years={years} onChange={onChange} currentYear={currentYear} />
        <button disabled={laterYearDisabled} onClick={() => onNavigate('later')}>
          &raquo;
        </button>
      </div>
    </div>
  );
};
