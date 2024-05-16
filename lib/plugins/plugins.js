
/**
 * @typedef {Object} pluginsData
 * @property {string[]} events
 * @property {string} name
 * @property {string} version
 * @property {Function} post
 * @property {Function} get
 * @property {Function} put
 * @property {Function} delete
 */


export default class plugins {
    /**
     * 
     * @param {pluginsData} e 
     */
    constructor(e) {
        this.events = e.events;
        this.name = e.name;
        this.pluginsData = e;
    }
}