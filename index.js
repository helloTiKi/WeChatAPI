import http from 'http'
import Api from './API/index.js'
import redis from './utils/redis.js'
import fs from 'fs'
import path from 'path'
import chokidar from 'chokidar'

import Server from './lib/start.js'

var s = new Server()
s.run()

global.Api = Api

/**
 * 
 * @param {string} key 
 * @param {string} value 
 * @param {number|string} expires 可以是Max-age的值，也可以是GMT格式的时间字符串,如果为空，则表示这个cookie会在浏览器关闭后被删除，也就是会话结束。
 * @param {string} path 
 * @param {string} domain 
 * @param {boolean} secure 
 */
function getCookieString(key, value, expires, path = '/', domain = "res.captcha.fyi", secure = true) {
    let retCookie = ""
    if (key == "" || value == "") return retCookie
    retCookie += `${key}=${value};`
    if (typeof expires == 'number') {
        if (expires > 0) {
            let date = new Date()
            date.setTime(date.getTime() + expires * 1000)
            retCookie += `expires=${date.toUTCString()};`
            retCookie += `max-age=${expires};`
        }
    } else {
        if (expires.indexOf('GMT') != -1) {
            retCookie += `expires=${expires};`
            let date = new Date(expires)
            retCookie += `max-age=${Math.floor((date.getTime() - new Date().getTime()) / 1000)};`
        }
    }
    if (path != "") retCookie += `path=${path};`
    if (domain != "") retCookie += `domain=${domain};`
    if (secure) retCookie += `secure=true;`
    retCookie += `SameSite=None;`
    return retCookie
}



let appId = "wx612ebcedde54913b", secret = "d97fc458d5528f8460c003b3c9f7b219";




//监听8080端口
//server.listen(8989)