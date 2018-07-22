import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import copy from "rollup-plugin-copy";
import sass from "rollup-plugin-scss";

export default {
    input: "./src/frontend.js",
    output: {
        file: "./dist/public/js/frontend.js",
        format: "iife",
        sourcemap: true
    },
    plugins: [
        resolve(),
        commonjs(),
        copy({
            "index.html": "dist/index.html"
        }),
        sass({
            output: "./dist/public/css/style.css"
        })
    ]
};