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

function forestAndTreeTemplate(forest, treeId) {
    return `<label class="label is-small">Forest</label>
    <table class="table is-fullwidth is-narrow is-bordered is-striped">
        <tr>
          <td>Strength</td>
          <td>${forest.strength}</td>
        </tr>
        <tr>
          <td>Number of Trees</td>
          <td>${forest.trees.length}</td>
        </tr>
        <tr>
          <td>Number of Samples</td>
          <td>${forest.totalSamples}</td>
        </tr>
    </table>
    <label class="label is-small">Selected Tree</label>
    <table class="table is-fullwidth is-narrow is-bordered is-striped">
        <tr>
          <td>ID</td>
          <td>#${treeId + 1}</td>
        </tr>
        <tr>
          <td>Strength</td>
          <td>${forest.trees[treeId].strength}</td>
        </tr>
    </table>`;
}

function treeTemplate(tree) {
    return `<table class="table is-fullwidth">
        <tr>
          <td style="font-weight: bold">Tree</td>
          <td></td>
        </tr>
        <tr>
          <td>Tree</td>
          <td>#${tree.id}</td>
        </tr>
        <tr>
          <td>Tree Strength</td>
          <td>${tree.strength}</td>
        </tr>
    </table>`;
}

function pieTemplate(bunch, classHistogram) {
    const classNames = classHistogram.reduce((accumulator, current) => {
        return accumulator + `<td>${current.sortKey}</td>`
    }, "");
    const classFreq = classHistogram.reduce((accumulator, current) => {
        return accumulator + `<td>${current.value}</td>`
    }, "");
    const classColors = classHistogram.reduce((accumulator, current) => {
        return accumulator + `<td><div style="background: ${current.color}; width: 15px; height: 10px;"></div></td>`
    }, "");
    return `<table class="table is-fullwidth">
        <tr>
          <td style="font-weight: bold">Consolidation Node</td>
          <td></td>
        </tr>
        <tr>
          <td>Depth</td>
          <td>${bunch.baseNode.depth}</td>
        </tr>
        <tr>
          <td>Samples</td>
          <td>${bunch.samples}</td>
        </tr>
    </table>
    ${getClassFrequencyTable(classNames, classFreq, classColors)}`;
}

function branchTemplate(branch) {
    return `<table class="table is-fullwidth is-narrow is-bordered is-striped">
        <tr>
          <td style="font-weight: bold">Branch</td>
          <td></td>
        </tr>
        <tr>
          <td>Depth</td>
          <td>${branch.depth}</td>
        </tr>
        <tr>
          <td>Impurity</td>
          <td>${branch.impurity}</td>
        </tr>
        <tr>
          <td>Drop of Impurity</td>
          <td>${branch.impurityDrop}</td>
        </tr>
        <tr>
          <td>Number of Samples</td>
          <td>${branch.samples}</td>
        </tr>
    </table>`;
}

function leafTemplate(leaf) {
    const classNames = leaf.classes.reduce((accumulator, current) => {
        return accumulator + `<td>${current.name}</td>`
    }, "");
    const classFreq = leaf.classes.reduce((accumulator, current) => {
        return accumulator + `<td>${current.count}</td>`
    }, "");
    const classColors = leaf.classes.reduce((accumulator, current) => {
        return accumulator + `<td><div style="background: rgb(${current.color}); width: 15px; height: 10px;"></div></td>`
    }, "");
    return `<label class="label is-small">Leaf</label>
    <table class="table is-fullwidth is-narrow is-bordered is-striped">
        <tr>
          <td style="font-weight: bold">ID</td>
          <td>#${leaf.leafId}</td>
        </tr>
        <tr>
          <td>Depth</td>
          <td>${leaf.depth}</td>
        </tr>
        <tr>
          <td>Impurity</td>
          <td>${leaf.impurity}</td>
        </tr>
    </table>
    ${getClassFrequencyTable(classNames, classFreq, classColors)}`;
}

function getClassFrequencyTable(classNames, classFreq, classColors) {
    return `<table class="table is-fullwidth">
        <tr style="text-transform: uppercase; font-size: 12px">
          ${classNames}
        </tr>
        <tr style="font-size: 12px">
          ${classFreq}
        </tr>
        <tr>
          ${classColors}
        </tr>
    </table>`;
}