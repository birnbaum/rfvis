import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
    input: './app/main.js',
    output: {
        file: './public/js/main.js',
        format: 'iife'
    },
    plugins: [
        resolve(),
        commonjs()
    ]
};