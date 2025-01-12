import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.tsx',
  output: {
    file: 'generated/inat-curated-species-list-standalone.js',
    format: 'cjs',
    compact: true,
  },
  plugins: [resolve(), typescript(), commonjs(), terser()],
};
