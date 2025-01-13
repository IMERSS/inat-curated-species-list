import { FC } from 'react';
import MoonLoader from 'react-spinners/MoonLoader';

export const Loader: FC = () => (
  <div className="icsl-loader-outer">
    <div className="icsl-loader-inner" />
    <MoonLoader />
  </div>
);
