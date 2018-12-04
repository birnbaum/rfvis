import fs from "fs";
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs'

const {dependencies, devDependencies} = JSON.parse(fs.readFileSync("./package.json"));
const external = ["fs", "path", "util", "react-dom/server", "csv-parse/lib/sync",
    ...Object.keys(dependencies), ...Object.keys(devDependencies)];

export default {
    input: "./src/render_tree_script.js",
    output: {
        file: "../build/render_tree_script.js",
        format: "cjs",
        //sourcemap: true,
        //banner: "#!/usr/bin/env node",
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
    // external: external,
};