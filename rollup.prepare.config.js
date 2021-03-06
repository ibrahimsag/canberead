import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { string } from "rollup-plugin-string";
import run from '@rollup/plugin-run';

export default [
{
  input: 'src/prepare.js',
  plugins: [
    nodeResolve({ preferBuiltins: false }),
    commonjs(),
    string({
      include: 'src/elements/*/*'
    }),
    run()
  ],
  output: {
    file: 'build/prepare.js',
    format: 'cjs',
    sourcemap: true,
  }
}
];
