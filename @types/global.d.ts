type listenFunction = (params: { data: object, headers: http.IncomingHttpHeaders, cookie: object }) => Promise<{ code: number, data: object, errmsg: string, headers: object, statusCode: number }>
type acceptFunction = (params: { data: object, headers: http.IncomingHttpHeaders, cookie: object }, plugins: plugins) => Promise<{ code: number, data: object, errmsg: string, headers: object, statusCode: number }>

declare class Server {
    listen: (method: "GET" | "POST" | "PUT" | "DELETE", url: string, func: listenFunction) => this
    Init(plugins: plugins): this
    accept: (url: string, func: acceptFunction) => this
    get: (url: string, func: listenFunction) => this
    post: (url: string, func: listenFunction) => this
    put: (url: string, func: listenFunction) => this
    delete: (url: string, func: listenFunction) => this
    start: (port: number) => void
}
declare const methods: "GET" | "POST" | "PUT" | "DELETE"
declare class plugins {
    get(url: string, func: listenFunction): this
    post(url: string, func: listenFunction): this
    put(url: string, func: listenFunction): this
    delete(url: string, func: listenFunction): this
    /**插件名字 */
    name: string
    /**事件名称
     * 接收的数据必须是json且必须有一个event键，插件会读取这个值并调用同名函数
     */
    events: string[]
}