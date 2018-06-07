/**
 * Internal tree data structure
 * The methods branchify() and toBranch() are just messy workarounds and should be refactored at some point
 */
export default class TreeNode {
    constructor(height, samples, impurity, impurityDrop, feature, children = []) {
        this.height = height;
        this.samples = samples;
        this.impurity = impurity;
        this.impurityDrop = impurityDrop;
        this.feature = feature;
        this.children = children;
    }

    /**
     * Adds a child node
     */
    add(node) {
        if(this.children.length >= 2) throw `Node ${this} already has two children`;
        this.children.push(node);
    }

    /**
     * Adds branch information to the node
     */
    branchify(index, x, y, angle, length, depth, parent) {
        this.index = index;
        this.x = x;
        this.y = y;
        this.x2 = x + length * Math.sin(angle);
        this.y2 = y - length * Math.cos(angle);
        this.angle = angle;
        this.length = length;
        this.depth = depth;
        this.parent = parent;
    }

    // This function should rather return the node itself without references to child nodes
    // This function is used to construct a set of branches that are to render
    // - x and y are the start coordinates
    // - angle and length are used to draw the line
    // - samples are used for the thickness
    // - impurity is used for the color
    // - index, depth and parent are currently unused
    toBranch() {
        const thisCopy = Object.assign({}, this);
        delete thisCopy.children;
        return thisCopy;
    }
}