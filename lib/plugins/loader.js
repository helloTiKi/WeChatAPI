import fs from 'fs'
import chokidar from 'chokidar'
import Path from 'path'
import gsData from '../gsData/gsData.js'


let relativePluginsPath = '../../plugins/'

class PluginsLoader {
    async getPlugins() {
        let plugins = []
        let dir = './plugins'
        let files = fs.readdirSync(dir, { withFileTypes: true })
        files.forEach(e => {
            if (e.name.endsWith('.js')) {
                plugins.push(`${relativePluginsPath}${e.name}`)
            }
        })

        for (let i = 0; i < plugins.length; i++) {
            plugins[i] = await this.pluginImport(plugins[i])
        }
        return plugins
    }
    /**
     * 
     * @param {string} pluginsPath 
     * @returns {plugins}
     */
    async pluginImport(pluginsPath) {
        try {
            let tmp = await import(pluginsPath)
            if (tmp.default) {
                return tmp.default
            } else {
                return undefined
            }
        } catch (error) {
            console.error(error)
            return undefined
        }

    }
    /**
     * 
     * @param {Server} server 
     */
    async pluginsInit(server) {
        this.listenFunc = server
        let plugins = await this.getPlugins()
        for (const F of plugins) {
            if (typeof F == 'function') {
                if (this.pluginsLoad(F)) {
                    console.log(`${F.name} 加载成功`)
                    this.watch(`./plugins/${(new F()).name}.js`)
                } else {
                    console.log(`${F.name} 加载失败`)
                }
            }
        }
        this.watchFile('./plugins/')
    }
    /**
     * 
     * @param {plugins} F 
     * @returns 
     */
    pluginsLoad(F) {
        try {
            let tmp = new F()
            this.listenFunc.Init(tmp).accept("/" + tmp.name, function (data, p) {
                let d = data.data
                if (d.event) {
                    let event = d.event
                    if (p.events.includes(event)) {
                        delete d.event
                        try {
                            return p[event](d)
                        } catch (error) {

                        }
                    }
                }
            })

            return true
        } catch (error) {
            return false
        }
    }
    /**
     * 
     * @param {string} filePath 
     */
    pluginNew(filePath) {
        if (!filePath.endsWith('.js') && !fs.existsSync(filePath)) {
            return
        }
        let pluginsName = Path.basename(filePath)
        let p = `${relativePluginsPath}${pluginsName}`
        this.pluginImport(p).then(e => {
            if (e) {
                if (this.pluginsLoad(e)) {
                    console.log(`${e.name} 加载成功`)
                    this.watch(`./plugins/${e.name}.js`)
                } else {
                    console.log(`${e.name} 加载失败`)
                }
            }
        })
    }
    /**
     * 
     * @param {string} filePath 
     */
    pluginReload(filePath) {
        let pluginsName = Path.basename(filePath)
        let p = `${relativePluginsPath}${pluginsName}?t=${Date.now()}`
        this.pluginImport(p).then(e => {
            if (e) {
                if (this.pluginsLoad(e)) {
                    console.log(`${e.name} 更新成功`)
                } else {
                    console.log(`${e.name} 更新加载失败`)
                }
            } else {
                console.log(`${p} 更新失败`)
            }
        })
    }
    /**
     * 监听文件修改，更新插件
     * @param {string} filePath 
     */
    watch(filePath) {
        let _path = filePath.replace("\\", "/")
        let watcher = chokidar.watch(_path, {
            ignored: /(^|[\/\\])\../, //忽略点文件
            ignoreInitial: true
        })
        watcher.on('all', (event, _path) => {
            if (event == 'change') {
                this.pluginReload(_path)
            }
        })
    }
    /**监听文件夹 */
    watchFile(_path) {
        //如果有新增的插件，读取并加载
        let watcher = chokidar.watch(_path, {
            ignored: /(^|[\/\\])\../, //忽略点文件
            ignoreInitial: true
        })
        watcher.on('all', (event, _path) => {
            if (event == 'add') {
                console.log(`${_path} 新增`)
            }
        })
    }
}







export default new PluginsLoader();