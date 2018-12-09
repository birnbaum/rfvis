import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs'

export default {
    input: "./src/render_tree_script.js",
    output: {
        file: "./build/render_tree_script.js",
        format: "cjs",
    },
    plugins: [
        resolve(),
        commonjs({
            include: 'node_modules/**'
        }),
        babel({
            exclude: 'node_modules/**',
            presets: ["@babel/preset-react"],
            plugins: ["@babel/plugin-proposal-class-properties"]
        }),
    ],
};