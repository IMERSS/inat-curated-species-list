import { FC, useState } from 'react';

interface YearDropdownProps {
    readonly years: string[]
    readonly onChange: (year: string) => void;
}

export const YearDropdown: FC<YearDropdownProps> = ({ years, onChange }) => {
    const [sortedYears] = useState(() => years.sort().reverse());

    return (
        <select onChange={(e) => onChange(e.target.value)}>
            {sortedYears.map((year) => (
                <option value={year} key={year}>{year}</option>
            ))}
        </select>
    );
};