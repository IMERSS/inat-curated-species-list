import { FC } from 'react';
import Image, { type ImageProps } from 'next/image';
import styles from './page.module.css';

type Props = Omit<ImageProps, 'src'> & {
  srcLight: string;
  srcDark: string;
};

const Home: FC = () => {
  return <div className={styles.page}>..</div>;
};

export default Home;
