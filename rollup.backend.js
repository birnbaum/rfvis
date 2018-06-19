import fs from "fs";
const {dependencies, devDependencies} = JSON.parse(fs.readFileSync('./package.json'));
const external = ["fs", "path", "util", ...Object.keys(dependencies), ...Object.keys(devDependencies)];

export default {
    input: './index.js',
    output: {
        file: './dist/index.js',
        format: 'cjs',
        sourcemap: true
    },
    external: external
};