export {branchTemplate, leafTemplate};

function branchTemplate(d) {
    return `<table class="table">
        <tr>
          <td>Type</td>
          <td>Branch</td>
        </tr>
        <tr>
          <td>Height</td>
          <td>${d.height}</td>
        </tr>
        <tr>
          <td>Impurity</td>
          <td>${d.impurity}</td>
        </tr>
        <tr>
          <td>Drop of Impurity</td>
          <td>${d.impurityDrop}</td>
        </tr>
        <tr>
          <td>Samples</td>
          <td>${d.samples}</td>
        </tr>
    </table>`;
}

function leafTemplate(d) {
    return `<table class="table">
        <tr>
          <td>Type</td>
          <td>Leaf</td>
        </tr>
        <tr>
          <td>Height</td>
          <td>${d.height}</td>
        </tr>
        <tr>
          <td>Impurity</td>
          <td>${d.impurity}</td>
        </tr>
        <tr>
          <td>Leaf ID</td>
          <td>${d.leafId}</td>
        </tr>
        <tr>
          <td>Class Frequency</td>
          <td>${d.classFrequency}</td>
        </tr>
    </table>`;
}