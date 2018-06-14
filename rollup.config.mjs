import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sass from 'rollup-plugin-scss';

export default {
    input: './app/main.js',
    output: {
        file: './public/js/main.js',
        format: 'iife',
        sourcemap: true
    },
    plugins: [
        resolve(),
        commonjs(),
        sass({
            output: './public/css/style.css'
        })
    ]
};