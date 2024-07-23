import React, { useState } from 'react';

export const YearDropdown = ({ years, onChange }) => {
    const [sortedYears] = useState(() => years.sort().reverse());

    return (
        <select onChange={(e) => onChange(e.target.value)}>
            {sortedYears.map((year) => (
                <option value={year} key={year}>{year}</option>
            ))}
        </select>
    );
};