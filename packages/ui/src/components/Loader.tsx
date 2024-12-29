'use client';

import { FC } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import styles from './Loader.module.css';
// const styles = {
//   loader: '',
//   loaderBg: '',
// };

export const Loader: FC = () => (
  <div className={styles.loader}>
    <div className={styles.loaderBg} />
    <CircularProgress />
  </div>
);
