import yargs from "yargs";
import startServer from "./server.mjs";
import writeSvgs from "./cli.mjs";
import rollup from "rollup";
import rollupOptions from "./rollup.config.mjs";

async function runGui({data}) {
    await rollup.rollup(rollupOptions);
    startServer(data);
}

async function runCli({data}) {
//    writeSvgs(data);
}

const argv = yargs
    .command(
        'cli <data>',
        'Command line interface to generate SVGs',
        yargs => yargs
            .positional('data', {
                describe: 'Folder containing the forest data'
            })
            .options({
                "width": {
                    alias: "w",
                    describe: "Width of the SVG",
                    default: 800,
                    number: true,
                },
                "height": {
                    alias: "h",
                    describe: "Height of the SVG",
                    default: 800,
                    number: true,
                },
                "depth": {
                    alias: "d",
                    describe: "Maximal depth of the tree rendering. Cut of leaves are visualized via consolidation nodes.",
                    number: true,
                },
                "leaf-color": {
                    describe: "Color of the leaves. Either the leaf impurity or the class assigned to the leaf.",
                    choices: ["impurity", "class"],
                    default: "impurity",
                },
                "leaf-impurity-threshold": {
                    describe: "Between 0 and 1. By default the impurity is mapped from 0 to 1 on a linear color gradient between red and green. If you set this flag, everything below the provided threshold is visualized red and the gradient will be linear between <threshold> and 1",
                    implies: "leaf-color",
                    default: 0,
                    number: true,
                },
                "branch-color": {
                    describe: "Color of the branches. Either the node's impurity or the node's drop-of-impurity.",
                    choices: ["impurity", "impurity-drop"],
                    default: "impurity",
                },
                /*
                "branch-impurity-threshold": {
                    describe: "program specifications",
                    implies: "branch-color",
                    default: 0,
                    number: true,
                }*/
                // TODO threshold for impurity drop?
            }),
        function (argv) {
            console.log(argv)
        }
    )
    .command(
        "gui <data>",
        "Graphical User Interface",
        yargs => yargs
            .positional('data', {
                describe: 'Folder containing the forest data'
            }),
        runGui
    )
    .help("help")
    .version("0.1.0")
    .argv;
