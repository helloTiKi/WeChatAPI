


let Plugins = {}

class PluginsLoader {
    async getPlugins() {
        let plugins = []
        let dir = './plugins'
        let files = fs.readdirSync(dir, { withFileTypes: true })
        files.forEach(e => {
            if (e.name.endsWith('.js')) {
                plugins.push('./plugins/' + e.name)
            }
        })

        for (let i = 0; i < plugins.length; i++) {
            plugins[i] = await this.pluginImport(plugins[i])
        }
        return plugins
    }
    async pluginImport(pluginsPath) {
        let tmp = await import(pluginsPath)
        if (tmp.default) {
            return tmp.default
        } else {
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
                    this.watch(`./plugins/${F.name}.js`)
                } else {
                    console.log(`${F.name} 加载失败`)
                }
            }
        }
    }

    pluginsLoad(F) {
        try {
            let tmp = new F()
            if (tmp.post) listenFunc.post(`/${F.name}`, tmp.post)
            if (tmp.get) listenFunc.get(`/${F.name}`, tmp.get)
            if (tmp.put) listenFunc.put(`/${F.name}`, tmp.put)
            if (tmp.delete) listenFunc.delete(`/${F.name}`, tmp.delete)
            return true
        } catch (error) {
            return false
        }
    }
    //监听文件修改，更新插件
    watch(filePath) {
        let _path = filePath.replace("\\", "/")
        let watcher = chokidar.watch(_path, {
            ignored: /(^|[\/\\])\../, //忽略点文件
            ignoreInitial: true
        })
        watcher.on('all', (event, _path) => {
            if (event == 'change') {
                let p = `./${_path.replace("\\", "/")}?t=${Date.now()}`
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
        })
    }
    /**监听文件夹 */
    watchFile(_path) {


    }
}







export default new PluginsLoader();