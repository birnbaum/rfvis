import fs from "fs";
import babel from 'rollup-plugin-babel';
// import commonjs from 'rollup-plugin-commonjs'

const {dependencies, devDependencies} = JSON.parse(fs.readFileSync("./package.json"));
const external = ["fs", "path", "util", "react-dom/server", ...Object.keys(dependencies), ...Object.keys(devDependencies)];

export default {
    input: "./index.js",
    output: {
        file: "./build/index.js",
        format: "cjs",
        sourcemap: true,
        banner: "#!/usr/bin/env node",
    },
    plugins: [
        babel({
            exclude: 'node_modules/**',
            presets: ["@babel/preset-react"],
            plugins: ["@babel/plugin-proposal-class-properties"]
        }),
    ],
    external: external,
};