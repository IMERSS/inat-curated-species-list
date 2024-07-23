import React from 'react';
import { YearDropdown } from './YearDropdown.component';

const NewAdditions = ({ data }) => {
    console.log(data);
    
    return (
        <>
            <YearDropdown years={Object.keys(data)} />
        </>
    );
};

export default NewAdditions;