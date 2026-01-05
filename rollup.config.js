import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import serve from 'rollup-plugin-serve';

const dev = process.env.ROLLUP_WATCH === 'true';

export default {
  input: 'src/climate-card.ts',
  output: {
    file: 'dist/climate-card.js',
    format: 'es',
    sourcemap: dev,
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false,
      declarationMap: false,
    }),
    !dev && terser({
      format: {
        comments: false,
      },
    }),
    dev && serve({
      contentBase: ['dist'],
      port: 5000,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }),
  ].filter(Boolean),
};
