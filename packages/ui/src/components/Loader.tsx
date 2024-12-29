'use client';

import { FC } from 'react';
import CircularProgress from '@mui/material/CircularProgress';

export const Loader: FC = () => (
  <div
    style={{
      position: 'absolute',
      top: 50,
      left: 0,
      right: 0,
      zIndex: 1,
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <div
      style={{
        position: 'absolute',
        backgroundColor: '#cccccc',
        padding: 20,
        width: 100,
        borderRadius: 10,
        height: '100%',
        opacity: 0.8,
      }}
    />
    <CircularProgress />
  </div>
);
