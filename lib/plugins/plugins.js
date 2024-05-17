
/**
 * @typedef {Object} pluginsData
 * @property {string[]} events 事件名称
 * @property {string} name 必须和文件名一致，否则会影响热更新
 * @property {string} version 插件版本
 * @property {Function} post  插件post事件
 * @property {Function} get  插件get事件
 * @property {Function} put  插件put事件
 * @property {Function} delete  插件delete事件
 */


class plugins {
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

/* Object.defineProperty(plugins.prototype, 'post', {
    writable: false,
}) */


export default plugins;