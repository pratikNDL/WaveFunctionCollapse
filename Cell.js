export default class Cell {
    constructor(n) {
        this.collapsed = false;
        this.options = Array.from({length: n}, (_, i) => i);
    }
}