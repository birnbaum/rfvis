export default class TreeNode {
    constructor(data) {
        this.depth = data.depth;
        this.id = data.id;
        this.impurity = data.impurity;
        this.n_node_samples = data.n_node_samples;
        this.classDistribution = data.classDistribution;
        this.children = [];
    }

    addChild(node) {
        if(this.children.length >= 2) throw `Node ${this} already has two children`;
        this.children.push(node);
        node.setParent(this);
    }

    setParent(node) {
        this.parent = node;
    }

    isLeaf() {
        return this.children.length === 0;
    }

    get bestClass() {
        let best;
        let indexOfBest;
        for (let i = 0; i < this.classDistribution.length; i++) {
            if (!best || this.classDistribution[i].count > best.count) {
                best = this.classDistribution[i];
                indexOfBest = i;
            }
        }
        return this.classDistribution[indexOfBest];
    }
}