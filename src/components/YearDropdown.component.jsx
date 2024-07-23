import React, { useState } from 'react';

export const YearDropdown = ({ years, onChange }) => {
    const [sortedYears] = useState(() => years.sort().reverse());

    return (
        <select onChange={onChange}>
            {sortedYears.map((year) => (
                <option value={year}>{year}</option>
            ))}
        </select>
    );
};