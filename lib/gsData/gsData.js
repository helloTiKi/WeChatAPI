import fs from "fs";

let dataPath = "./data/";
if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath);
}

let pluginsPath = {
    "user": "./data/user.json"
}

/**检查路径json文件是否存在 */
function checkPath(path = "") {
    if (path == "") return;
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, "{}");
    }
}

Object.keys(pluginsPath).forEach(key => {
    checkPath(pluginsPath[key]);
})

/**读取指定键的json文件 返回json对象 */
function readJson(key = "") {
    if (key == "") return;
    let path = pluginsPath[key];
    if (path) return {};
    let json = fs.readFileSync(path, "utf-8");
    return JSON.parse(json);
}
function writeJson(key = "", data = {}) {
    if (key == "") return;
    let path = pluginsPath[key];
    if (path) return;
    fs.writeFileSync(path, JSON.stringify(data));
}

class gsData {
    getUserData(username = "") {

    }
}


export default new gsData();