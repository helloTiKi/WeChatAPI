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
    }
    /**
     * 
     * @param {string} url 
     * @param {listenFunc} func 
     */
    get(url, func) {
        this.getFunc[url] = func
        return this
    }
    /**
     * 
     * @param {string} url 
     * @param {listenFunc} func 
     */
    post(url, func) {
        this.postFunc[url] = func
        return this
    }
    /**
     * 
     * @param {string} url 
     * @param {listenFunc} func 
     */
    put(url, func) {
        this.putFunc[url] = func
        return this
    }
    /**
     * 
     * @param {string} url 
     * @param {listenFunc} func 
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