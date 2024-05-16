import Api from "../API/index.js";
import gsData from "../lib/gsData/gsData.js";

//import plugins from "../plugins.js";

const plugins = (await import("../lib/plugins/plugins.js")).default;

export default class NetworkVerification extends plugins {
    constructor() {
        super({
            name: "NetworkVerification",
            version: "0.0.1",
            description: "网络验证插件",
            priority: 1000,
            enable: true,
            events: ["getFileMd5", "getFileLastModified"]
        });
    }
    /**
     * 
     * @param {{data:object,headers:http.IncomingHttpHeaders,cookie:object}} e 
     */
    async post(e) {
        let { data, headers, cookie } = e
        let retdata = {
            code: 0,
            data: {},
            headers: {},
            statusCode: 200,
            errmsg: "ok"
        }
        e.retdata = retdata
        console.log("NetworkVerification:post:", e)
        switch (data.event) {
            case "acquireAdminPrivileges":
                let isAdmin = await Api.isAdmin({
                    deviceCode: data.data.m,
                    type: "NetworkVerification"
                })
                if (isAdmin) {
                    let token = await Api.getNewAdminToken({
                        deviceCode: data.data.m,
                    })
                    if (token) {
                        retdata.data = { token: token.token }
                        retdata.headers = {
                            "set-cookie": [getCookieString("token", token.token, Math.floor((token.expireTime - new Date().getTime()) / 1000))],
                            token: token.token
                        }
                    }
                } else {
                    retdata.code = -1
                    retdata.errmsg = "no permission"
                    retdata.statusCode = 403
                }
                break

            default: retdata.code = -1, retdata.errmsg = "event not found"
        }
        return retdata
    }
    async put(e) {
        let { data, headers, cookie } = e
        let retdata = {
            code: 0,
            data: {},
            headers: {},
            statusCode: 200,
            errmsg: "ok"
        }
        e.retdata = retdata
        console.log("NetworkVerification:put:", e)
        let token = headers['token']
        let deviceCode = headers['devicecode']
        if (!token) {
            return retdata.code = -1, retdata.errmsg = "token missing", retdata.statusCode = 401, retdata
        }
        let AdminToken = await Api.checkAdminToken({ token: token, type: "NetworkVerification", deviceCode: deviceCode })
        switch (AdminToken) {
            case undefined:
                return retdata.code = -2, retdata.errmsg = "token is not found", retdata.statusCode = 404, retdata
            case false:
                return retdata.code = -3, retdata.errmsg = "token is expired", retdata.statusCode = 401, retdata
            case true:
                //认证成功，更新服务端文件
                if (await Api.upFile({ fileName: headers['filename'], fileType: headers['filetype'], data: data })) {
                    return retdata
                } else {
                    return retdata.code = -4, retdata.errmsg = "upload file failed", retdata.statusCode = 404, retdata
                }
            default:
                return retdata.code = -5, retdata.errmsg = "unknown error", retdata.statusCode = 500, retdata
        }
    }
    async getFileMd5(data) {
        let retdata = {
            code: 0,
            data: {},
            headers: {},
            statusCode: 200,
            errmsg: "ok"
        }
        let md5 = await Api.getFileMd5({
            FileName: data.data.FileName
        })
        if (md5) {
            retdata.data = { md5: md5 }
            retdata.headers = {
                "fileMd5": md5
            }
        } else {
            retdata.code = -1
            retdata.errmsg = "file not found"
            retdata.statusCode = 404
        }
        return retdata
    }
    async getFileLastModified(data) {
        let retdata = {
            code: 0,
            data: {},
            headers: {},
            statusCode: 200,
            errmsg: "ok"
        }
        let lastModified = await Api.getFileLastModified({
            FileName: data.data.FileName
        })
        if (lastModified) {
            retdata.data = { lastModified: lastModified }
            retdata.headers = {
                "fileLastModified": lastModified
            }
        } else {
            retdata.code = -1
            retdata.errmsg = "file not found"
            retdata.statusCode = 404
        }
        return retdata
    }
    async userLoginByPassword(data) {
        let retdata = {
            code: 0,
            data: {},
            headers: {},
            statusCode: 200,
            errmsg: "ok"
        }
        let { username, password } = data.data
        
    }
}