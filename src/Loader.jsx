import React from 'react';
import LoadingSpinner from 'react-spinners/MoonLoader.js';
import styles from './Loader.module.css';

const Loader = () => (
    <div className={styles.loader}>
        <div className={styles.loaderBg} />
        <LoadingSpinner color="#000000" />
    </div>
);

export default Loader;
