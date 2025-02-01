import { FC, useState } from 'react';

interface YearDropdownProps {
  readonly years: string[];
  readonly onChange: (year: string) => void;
  readonly currentYear: string;
}

export const YearDropdown: FC<YearDropdownProps> = ({ years, onChange, currentYear }) => {
  const [sortedYears] = useState(() => years.sort().reverse());

  return (
    <select onChange={(e) => onChange(e.target.value)} value={currentYear}>
      {sortedYears.map((year) => (
        <option value={year} key={year}>
          {year}
        </option>
      ))}
    </select>
  );
};
