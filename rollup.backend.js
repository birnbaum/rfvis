import fs from "fs";
const {dependencies, devDependencies} = JSON.parse(fs.readFileSync("./package.json"));
const external = ["fs", "path", "util", "child_process", ...Object.keys(dependencies), ...Object.keys(devDependencies)];

export default {
    input: "./src/index.js",
    output: {
        file: "./dist/index.js",
        format: "cjs",
        sourcemap: true
    },
    external: external
};