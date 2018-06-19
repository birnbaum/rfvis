import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sass from 'rollup-plugin-scss';

export default {
    input: './src/main.js',
    output: {
        file: './dist/public/js/main.js',
        format: 'iife',
        sourcemap: true
    },
    plugins: [
        resolve(),
        commonjs(),
        sass({
            output: './dist/public/css/style.css'
        })
    ]
};