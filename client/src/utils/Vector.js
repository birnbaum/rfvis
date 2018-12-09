export default class Vector {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    static fromDirectionAndLength(direction, length) {
        return new Vector(Math.sin(direction), Math.cos(direction)).multiply(length)
    }

    getDirection() {
        return Math.atan2(this.y, this.x);
    }

    setDirection(direction) {
        const length = this.setLength();
        this.x = Math.cos(direction) * length;
        this.y = Math.sin(direction) * length;
        return this;
    }

    getLength() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    setLength(length) {
        const direction = this.getDirection();
        this.x = Math.cos(direction) * length;
        this.y = Math.sin(direction) * length;
        return this;
    }

    add(v2) {
        return new Vector(this.x + v2.x, this.y + v2.y);
    }

    subtract(v2) {
        return new Vector(this.x - v2.x, this.y - v2.y);
    }

    multiply(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    divide(scalar) {
        return new Vector(this.x / scalar, this.y / scalar);
    }

    copy() {
        return new Vector(this.x, this.y);
    }

    toString() {
        return `Vector(${this.x}, ${this.y})`;
    }

    toArray() {
        return [this.x, this.y];
    }

    toObject() {
        return {x: this.x, y: this.y};
    }
}