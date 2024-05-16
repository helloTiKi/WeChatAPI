import Api from './API/index.js'
import Server from './lib/start.js'

var s = new Server()
s.run()

global.Api = Api





let appId = "wx612ebcedde54913b", secret = "d97fc458d5528f8460c003b3c9f7b219";




//监听8080端口
//server.listen(8989)