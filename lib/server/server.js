import http from 'http'
import serverListen from './serverListen.js'

let listenFunc = new serverListen()

/**
 * 
 * @param {string} _contentType 
 * @returns 
 */
function getContentType(_contentType) {
    let retdata = {
        /**表示主类型，对于text/html，type就是text */
        type: '',
        /**表示子类型，对于text/html，subtype就是html */
        subtype: '',
        /**表示字符集，比如utf-8； */
        charset: 'utf-8',
        /**用于分割消息体中多个实体之间的边界*/
        boundary: '',
        /**用于标识消息体的开头部分 */
        start: '',
        /**用于指示消息体中使用的自然语言 */
        language: '',
        /**可以添加其他的定制属性，这些属性必须以“X-”开头。 */
        extension: ''
    }

    typeof _contentType == 'string' && _contentType.split(';').forEach(e => {
        let data = e.toLowerCase();
        let isOK = false;
        data.replace(/charset=([\s|\S]*)/g, (_a, value, _c) => {
            if (['utf8', 'utf-8'].includes(value)) {
                retdata.charset = 'utf-8'
            } else retdata.charset = value;
            isOK = true;
        })
        if (isOK) return
        data.replace(/([application|audio|font|image|message|model|multipart|text|video]*)\/([\s|\S]*)/g, (_a, type, subtype) => {
            retdata.type = type, retdata.subtype = subtype;
            isOK = true;
        })
        if (isOK) return
    })
    return retdata;
}
const server = http.createServer(function (req, res) {
    const reply = function (e) {
        if (typeof e == 'object') {
            if (e.headers) {
                let headers = e.headers
                delete e.headers
                Object.keys(headers).forEach(e => {
                    if (headers[e] == 'set-cookie') {
                        headers[e].forEach(e => {
                            res.setHeader("set-cookie", e)
                        })
                    } else res.setHeader(e, headers[e])
                })
            }
            if (e.statusCode != undefined) {
                res.statusCode = e.statusCode
                delete e.statusCode
            }
            res.setHeader("Content-Type", "application/json")
            e = JSON.stringify(e)
        } else res.setHeader("Content-Type", "text/html")
        res.end(e)
    }
    //处理接受的的data数据，根据content-type来处理
    const checkData = function (data) {
        let type = getContentType(req.headers['content-type']);
        switch (type.type) {
            case 'application':
                switch (type.subtype) {
                    case 'json':
                        data = JSON.parse(data + '');
                        break
                }
        }
        return data
    }
    let calldata = { data: {}, headers: {}, cookie: {} }
    calldata.headers = function (s) {
        let headers = {}
        Object.keys(s).forEach(e => {
            headers[e] = decodeURIComponent(s[e])
        })
        return headers
    }(req.headers)
    calldata.cookie = function (s) {
        let cookie = {}
        s && s.split(';').forEach(e => {
            let text = e.replace(/; /g, ";") //将分号后的空格删除
            text.replace(/(.*?)=(.*?)$/g, (_str, key, value) => {
                cookie[key] = value
                return ""
            })
        })
        return cookie
    }(req.headers.cookie)
    if (req.method == 'GET') {
        console.log("有客户Get请求了=>" + req.url)
        {
            var url = req.url;
            var params = {};
            var i = 0;
            if (i = url.indexOf("?"), i != -1) {
                let d = url.slice(i + 1, url.length);
                url = url.slice(0, i)
                d.split("&").forEach(e => {
                    let key = e.split("=");
                    params[key[0]] = key[1]
                })
            }
        }
        calldata.data = params
        try {
            listenFunc.emit(url, 'GET', calldata).then(e => {
                reply(e)
            })
        } catch (error) {
            console.error(error)
            console.error(url + '路径未定义')
            res.writeHead(404)
            res.end()

        }
        return
    } else if (req.method == 'POST') {
        let data = new Uint8Array();
        req.on('data', function (d) {
            data += d;
            //console.log('有数据')
        })
        req.on('end', function () {
            try {
                calldata.data = checkData(data)
                listenFunc.emit(req.url, 'POST', calldata).then(e => {
                    reply(e)
                })
            } catch (error) {
                try {
                    postFunc['default'] && postFunc['default'](req, res, data)
                } catch (error) {
                    console.error(error)
                    res.writeHead(404)
                    res.end()
                }
            }
        })

    } else if (req.method == 'PUT') {
        let length = req.headers['content-length']
        let data = new Uint8Array(Number(length));
        let index = 0
        req.on('data', function (d) {
            data.set(d, index)
            index += d.length
        })
        req.on('end', function () {
            calldata.data = checkData(data)
            try {
                listenFunc.emit(req.url, 'PUT', calldata).then(e => {
                    reply(e)
                })
            } catch (error) {

            }
        })
    } else if (req.method == 'DELETE') {
        let data = new Uint8Array();
        req.on('data', function (d) {
            data += d;
        })
        req.on('end', function () {
            calldata.data = checkData(data)
            try {
                listenFunc.emit(req.url, 'DELETE', calldata).then(e => {
                    reply(e)
                })
            } catch (error) {
                console.error(error)
                res.writeHead(404)
                res.end()
            }
        })
    }
});


class Server {
    /**
     * 
     * @param {methods} method 
     * @param {string} url 
     * @param {listenFunction} func 
     * @returns 
     */
    listen(method, url, func) {
        let key = method.toLocaleLowerCase()
        listenFunc[key] && listenFunc[key](url, func)
        return this
    }
    /**
     * 
     * @param {string} url 
     * @param {listenFunction} func 
     * @returns 
     */
    get(url, func) {
        return this.listen('GET', url, func)
    }
    /**
     * 
     * @param {string} url 
     * @param {listenFunction} func 
     * @returns 
     */
    post(url, func) {
        return this.listen('POST', url, func)
    }
    /**
     * 
     * @param {string} url 
     * @param {listenFunction} func 
     * @returns 
     */
    put(url, func) {
        return this.listen('PUT', url, func)
    }
    /**
     * 
     * @param {string} url 
     * @param {listenFunction} func 
     * @returns 
     */
    delete(url, func) {
        return this.listen('DELETE', url, func)
    }
    /**
     * 
     * @param {number} port 
     * @returns 
     */
    start(port) {
        server.listen(port)
        return this
    }
}
console.log("服务器初始化")
export default new Server();