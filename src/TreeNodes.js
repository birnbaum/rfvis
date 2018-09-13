export {InternalNode, LeafNode}

/**
 * Internal tree data structure
 */
class InternalNode {
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

class LeafNode {
    constructor(rawDataFields) {
        this.depth = Number.parseInt(rawDataFields[0]);
        this.leafId = Number.parseInt(rawDataFields[1]);
        this.samples = Number.parseInt(rawDataFields[3]);
        this.impurity = Number.parseFloat(rawDataFields[4]);

        const parts = rawDataFields[5].split(",").map(c => Number.parseInt(c));
        this.noClasses = parts[0];

        // TODO Currently hardcoded
        this.classes = [
            {
                name: "city",
                color: [0,0,255],
                count: parts[1]
            },
            {
                name: "streets",
                color: [255,0,0],
                count: parts[2]
            },
            {
                name: "forest",
                color: [0,128,0],
                count: parts[3]
            },
            {
                name: "field",
                color: [0,255,255],
                count: parts[4]
            },
            {
                name: "shrubland",
                color: [0,255,0],
                count: parts[5]
            },
        ];
        this.bestClass = LeafNode.getBestClass(this.classes);
    }

    setParent(node) {
        this.parent = node;
    }

    static getBestClass(classes) {
        let best;
        let indexOfBest;
        for (let i = 0; i < classes.length; i++) {
            if (!best || classes[i].count > best.count) {
                best = classes[i];
                indexOfBest = i;
            }
        }
        return classes[indexOfBest];
    }
}