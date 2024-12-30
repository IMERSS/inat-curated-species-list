'use client';

import { FC } from 'react';
import CircularProgress from '@mui/material/CircularProgress';

export const Loader: FC = () => (
  <div className="inat-curated-species-loader-outer">
    <div className="inat-curated-species-loader-inner" />
    <CircularProgress className="inat-curated-species-loader" />
  </div>
);
