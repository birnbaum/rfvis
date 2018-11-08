export default class InternalNode {
    constructor(rawDataFields) {
        this.depth = Number.parseInt(rawDataFields[0]);
        this.samples = Number.parseInt(rawDataFields[3]);
        this.impurity = Number.parseFloat(rawDataFields[4]);
        this.impurityDrop = Number.parseFloat(rawDataFields[5]);
        this.children = [];
    }

    /** Adds a child node */
    add(node) {
        if(this.children.length >= 2) throw `Node ${this} already has two children`;
        this.children.push(node);
        node.setParent(this);
    }

    setParent(node) {
        this.parent = node;
    }
}