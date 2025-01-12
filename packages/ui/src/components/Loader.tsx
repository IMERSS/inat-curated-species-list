'use client';

import { FC } from 'react';
import CircularProgress from '@mui/material/CircularProgress';

export const Loader: FC = () => (
  <div className="icsl-loader-outer">
    <div className="icsl-loader-inner" />
    <CircularProgress className="icsl-loader-graphic" />
  </div>
);
