import server from "./server/server.js";
import ListenerLoader from "./listener/loader.js";

export default class Server {
    run() {
        // 启动服务器
        server.start(8989);
        ListenerLoader.load(server);
    }
}