import axios from "axios";
import fs from "fs";
import crypto from "crypto";
import redis from "../utils/redis.js"

function md5(e) {
    return crypto.createHash("md5").update(e).digest("hex")
}

Object.defineProperty(Object.prototype, "toUrl", {
    get: function () {
        let key = Object.keys(this)
        let keys = []
        for (const k of key) {
            keys.push(`${k}=${this[k]}`)
        }
        return keys.join("&")
    },
    enumerable: false
})

/**
 * @typedef loginCredentials
 * @property {string} appid 小程序 appId
 * @property {string} secret 小程序 appSecret
 * @property {string} js_code 登录时获取的 code，可通过wx.login获取
 * @property {string|"authorization_code"} grant_type 授权类型，此处只需填写 authorization_code
 */

/**
 * @typedef codesession
 * @property {string} session_key 会话密钥
 * @property {string} unionid 用户在开放平台的唯一标识符，若当前小程序已绑定到微信开放平台账号下会返回
 * @property {string} errmsg 错误信息
 * @property {string} openid 用户唯一标识
 * @property {number} errcode 错误码
 */

let paths = {
    "/": "C:/inetpub/wwwroot/",
    "/downloads/": "C:/inetpub/wwwroot/downloads/"
}
let webDownloadsPath = "C:/inetpub/wwwroot/downloads/"
class Api {

    constructor() {
        this.fileMd5 = {}
    }
    /**
     * 登录凭证校验。
     * @param {loginCredentials}e
     * @returns {Promise<codesession>}
     */
    jscode2session(e) {
        let url = "https://api.weixin.qq.com/sns/jscode2session?" + e.toUrl()
        return new Promise((resolve, reject) => {
            axios.get(url).then((res) => {
                resolve(res.data)
            })
        })

    }
    /**
     * 
     * @param {{grant_type:"client_credential",appid:string,secret:string}} e 
     * @returns {Promise<{access_token:string,expires_in:number}>}
     */
    getAccessToken(e) {
        let url = "https://api.weixin.qq.com/cgi-bin/token?" + e.toUrl()
        return new Promise((resolve, reject) => {
            axios.get(url).then((res) => {
                resolve(res.data)
            })
        })
    }
    /**
     * 
     * @param {{path:string,FileName:string}} e 
     * @returns {Promise<string|undefined>}
     */
    getFileMd5(e) {
        let path = e.path || webDownloadsPath
        let filePath = path + e.FileName
        return new Promise((resolve, reject) => {
            if (this.fileMd5[filePath]) {
                resolve(this.fileMd5[filePath])
                return
            }
            try {
                let fdata = fs.readFileSync(filePath)
                let _md5 = md5(fdata)
                this.fileMd5[filePath] = _md5
                resolve(_md5)
            } catch (error) {
                resolve(undefined)
            }
        })
    }
    /**
     * 取文件最后修改时间 
     * @param {{path:string,FileName:string}} e 
     * @returns {Promise<string|undefined>}
     * */
    getFileLastModified(e) {
        let path = e.path || webDownloadsPath
        let filePath = path + e.FileName
        return new Promise((resolve) => {
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    resolve(undefined)
                    return
                }
                resolve(stats.mtime.getTime() + "")
            })
        })

    }
    /**
     * 
     * @param {{type:string,deviceCode:string}} e 
     */
    async isAdmin(e) {
        async function check(deviceCode, type) {
            let redisKey = "authorizeAdmin"
            if (type) redisKey = type + ":authorizeAdmin"
            let admin = await redis.get(redisKey)
            if (!admin) {
                return undefined
            }
            admin = JSON.parse(admin)
            if (admin.includes(deviceCode)) {
                return true
            } else return false
        }
        //在全局管理员数组中寻找是否有对应的机器码
        if (await check(e.deviceCode)) {
            return true
        } else {
            //在全局管理员中没有找到对应的机器码，则判断管理员分类是否有值
            //如果有值，则判断管理员分类中是否有对应的机器码
            if (e.type) {
                if (await check(e.deviceCode, e.type)) {
                    return true
                } else {
                    return false
                }
            }
            return false
        }
    }
    /**
     * 
     * @param {{type:string,deviceCode:string}} e 
     * @returns 
     */
    async addAdmin(e) {
        let redisKey = "authorizeAdmin"
        if (e.type) redisKey = e.type + ":authorizeAdmin"
        let admin = await redis.get(redisKey)
        if (!admin) {
            admin = []
        } else if (typeof admin == "string") admin = JSON.parse(admin)
        if (admin.includes(e.deviceCode)) {
            return true
        } else {
            admin.push(e.deviceCode)
            await redis.set(redisKey, JSON.stringify(admin))
            return true
        }
    }

    async removeAdmin(e) {
        let redisKey = "authorizeAdmin"
        if (e.type) redisKey = e.type + ":authorizeAdmin"
        let admin = await redis.get(redisKey)
        if (!admin) {
            return true
        } else if (typeof admin == "string") admin = JSON.parse(admin)
        if (admin.includes(e.deviceCode)) {
            admin.splice(admin.indexOf(e.deviceCode), 1)
            await redis.set(redisKey, JSON.stringify(admin))
            return true
        } else {
            return false
        }
    }
    /**
     * 
     * @param {{type:string,deviceCode:string}} e
     * @returns {Promise<{token:string,expireTime:number}>} 
     */
    async getNewAdminToken(e) {
        let redisKey = "AdminToken"
        if (e.type) redisKey = e.type + ":AdminToken"
        let redisValue = await redis.get(redisKey)
        if (!redisValue) {
            redisValue = {}
        } else if (typeof redisValue == "string") redisValue = JSON.parse(redisValue)

        if (redisValue[e.deviceCode] && redisValue[e.deviceCode].expireTime < new Date().getTime()) {
            let token = this.generateRandomUUID()
            redisValue[e.deviceCode] = {
                token: token,
                expireTime: new Date().getTime() + 3600 * 1000
            }
            await redis.set(redisKey, JSON.stringify(redisValue))
            await redis.setEx(token, 3600, e.deviceCode)
        }
        return redisValue[e.deviceCode]
    }
    /**
     * 
     * @param {{type:string,token:string,deviceCode:string} e 
     * @returns 
     */
    async checkAdminToken(e) {
        let redisKey = "AdminToken"
        if (e.type) redisKey = e.type + ":AdminToken"

        let redisValue = await redis.get(redisKey)
        if (!redisValue) {
            if (!!e.type) {
                return await this.checkAdminToken({ ...e, type: "" })
            }
            return undefined
        } else if (typeof redisValue == "string") redisValue = JSON.parse(redisValue)

        if (redisValue[e.deviceCode]) {
            if (redisValue[e.deviceCode].token !== e.token) {
                return false
            }
            if (redisValue[e.deviceCode].expireTime > new Date().getTime()) {
                return true
            } else {
                delete redisValue[e.deviceCode]
                await redis.set(redisKey, JSON.stringify(redisValue))
                return false
            }
        } else return undefined
    }
    /**
     * 
     * @param {{fileName:string,fileType:string,filePath:string,data:Buffer}} e 
     * @returns 
     */
    async upFile(e) {
        let { fileName, fileType, filePath } = e
        if (!fileName) return false
        let path = filePath || paths[fileType] || paths['/downloads/']
        if (!path) return false
        //判断文件夹是否存在
        if (!fs.existsSync(path)) {
            //不存在创建文件夹
            fs.mkdirSync(path, { recursive: true })
        }
        path += fileName
        //写入文件
        fs.writeFileSync(path, e.data, { encoding: 'utf-8' })
        return true
    }
    generateRandomUUID() {
        const characters = '0123456789abcdef';
        let result = '';
        for (let i = 0; i < 32; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters[randomIndex];
        }
        return `${result.slice(0, 8)}-${result.slice(8, 12)}-${result.slice(12, 16)}-${result.slice(16, 20)}-${result.slice(20)}`;
    }
}



export default new Api()