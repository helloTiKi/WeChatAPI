import util from 'node:util'


class serverListen {
    constructor() {
        /**@private */
        this.postFunc = {}
        /**@private */
        this.getFunc = {}
        /**@private */
        this.putFunc = {}
        /**@private */
        this.deleteFunc = {}
        /**@private */
        this.acceptFunc = {}
    }
    /**
     * 不管什么请求类型都执行, 返回值不为undefined,那么会结束后续逻辑，如果要返回undefined，请改用其他表达方式
     * @param {string} url 
     * @param {listenFunction} func 
     * @returns 
     */
    accept(url, func) {
        this.acceptFunc[url] = func
        return this
    }
    /**
     * 
     * @param {string} url 
     * @param {listenFunction} func 
     */
    get(url, func) {
        this.getFunc[url] = func
        return this
    }
    /**
     * 
     * @param {string} url 
     * @param {listenFunction} func 
     */
    post(url, func) {
        this.postFunc[url] = func
        return this
    }
    /**
     * 
     * @param {string} url 
     * @param {listenFunction} func 
     */
    put(url, func) {
        this.putFunc[url] = func
        return this
    }
    /**
     * 
     * @param {string} url 
     * @param {listenFunction} func 
     */
    delete(url, func) {
        this.deleteFunc[url] = func
        return this
    }
    /**
     * @private
     * @param {string} url 
     * @param {string} method 
     * @param {{data:object,headers:http.IncomingHttpHeaders,cookie:object}} data 
     * @returns {Promise<{code:number,data:object,errmsg:string,headers:object,statusCode:number}>}
     */
    async emit(url, method, data) {
        try {
            if (this.acceptFunc[url]) {
                let d = this.acceptFunc[url]({ ...data, method })
                if (util.types.isPromise(d)) d = await d
                if (d !== undefined) {
                    return d
                }
            }
            let funcKey = method.toLocaleLowerCase() + "Func"
            let func = this[funcKey][url]
            if (!func) {
                func = this[funcKey]['default']
                if (!func) {
                    return new Promise((resolve) => {
                        resolve({ code: -1, data: {}, statusCode: 404, errmsg: "api not found" })
                    })
                } else return func(data)

            } else {
                return func(data)
            }

        } catch (error) {
            return new Promise((resolve) => {
                resolve({ code: -1, data: {}, statusCode: 404, errmsg: "api not found" })
            })
        }
    }
}
export default serverListen