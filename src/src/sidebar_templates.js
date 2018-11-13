/**
 * This module provides functions to change the content of the info sidebar
 */

export {updateForestAndTreeInfo, treeMouseover, pieMouseover, branchMouseover, leafMouseover, mouseout};

let $forest;
let $hover;
if (typeof $ !== "undefined") {
    $forest = $("#forest-info");
    $hover = $("#hover-info");
}

function updateForestAndTreeInfo(forest, treeId) {
    $forest.empty();
    $forest.append(forestAndTreeTemplate(forest, treeId));
}

function treeMouseover(tree) {
    $hover.empty();
    $hover.append(treeTemplate(tree));
}

function pieMouseover(bunch, classHistogram) {
    $hover.empty();
    $hover.append(pieTemplate(bunch, classHistogram));
}

function branchMouseover(branch) {
    $hover.empty();
    $hover.append(branchTemplate(branch));
}

function leafMouseover(leaf) {
    $hover.empty();
    $hover.append(leafTemplate(leaf));
}

function mouseout() {
    $hover.empty();
}
