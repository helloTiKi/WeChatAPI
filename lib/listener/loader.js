import PluginsLoader from '../plugins/loader.js';

class ListenerLoader {
    async load(server) {
        //pluginsInit
        await PluginsLoader.pluginsInit(server)

    }
}



export default new ListenerLoader();