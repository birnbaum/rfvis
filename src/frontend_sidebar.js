/**
 * This module provides functions to change the content of the info sidebar
 */

export {showForestAndTreeInfo, branchMouseover, leafMouseover, mouseout};

const $forest = $("#forest-info");
const $hover = $("#hover-info");

function showForestAndTreeInfo(forest, treeId) {
    $forest.empty();
    $forest.append(forestAndTreeTemplate(forest, treeId));
    $forest.show();
}

function branchMouseover(branch) {
    $forest.hide(0);
    $hover.append(branchTemplate(branch));
}

function leafMouseover(leaf) {
    $forest.hide(0);
    $hover.append(leafTemplate(leaf));
}

function mouseout() {
    $hover.empty();
    $forest.show();
}

function forestAndTreeTemplate(forest, treeId) {
    return `<table class="table">
        <tr>
          <td>Forest Strength</td>
          <td>${forest.strength}</td>
        </tr>
        <tr>
          <td>Number of trees</td>
          <td>${forest.trees.length}</td>
        </tr>
        <tr>
          <td style="border: 0; padding-bottom: 30px;">Number of samples</td>
          <td style="border: 0; padding-bottom: 30px;">${forest.totalSamples}</td>
        </tr>
        <tr>
          <td>Tree</td>
          <td>#${treeId + 1}</td>
        </tr>
        <tr>
          <td>Tree Strength</td>
          <td>${forest.trees[treeId].strength}</td>
        </tr>
    </table>`;
}

function branchTemplate(branch) {
    return `<table class="table">
        <tr>
          <td style="font-weight: bold">Branch</td>
          <td></td>
        </tr>
        <tr>
          <td>Height</td>
          <td>${branch.height}</td>
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
          <td>Samples</td>
          <td>${branch.samples}</td>
        </tr>
    </table>`;
}

function leafTemplate(leaf) {
    return `<table class="table">
        <tr>
          <td style="font-weight: bold">Leaf</td>
          <td></td>
        </tr>
        <tr>
          <td>Height</td>
          <td>${leaf.height}</td>
        </tr>
        <tr>
          <td>Impurity</td>
          <td>${leaf.impurity}</td>
        </tr>
        <tr>
          <td>Leaf ID</td>
          <td>${leaf.leafId}</td>
        </tr>
        <tr>
          <td>Class Frequency</td>
          <td>${leaf.classFrequency}</td>
        </tr>
    </table>`;
}