'use client';

import { FC } from 'react';
import LoadingSpinner from 'react-spinners/MoonLoader.js';
import styles from './Loader.module.css';

export const Loader: FC = () => (
  <div className={styles.loader}>
    <div className={styles.loaderBg} />
    <LoadingSpinner color="#000000" />
  </div>
);
