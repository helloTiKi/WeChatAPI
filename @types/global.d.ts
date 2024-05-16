type listenFunction = (params: { data: object, headers: http.IncomingHttpHeaders, cookie: object }) => Promise<{ code: number, data: object, errmsg: string, headers: object, statusCode: number }>


declare class Server {
    listen: (method: "GET" | "POST" | "PUT" | "DELETE", url: string, func: listenFunction) => this
    get: (url: string, func: listenFunction) => this
    post: (url: string, func: listenFunction) => this
    put: (url: string, func: listenFunction) => this
    delete: (url: string, func: listenFunction) => this
    start:(port: number) => void
}
declare const methods: "GET" | "POST" | "PUT" | "DELETE"