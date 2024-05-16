import { createClient } from 'redis'

var redis = await async function () {
    const redisUrl = `redis://127.0.0.1:6379/0`
    let client = createClient({ url: redisUrl })
    try {
        console.log('正在连接redis')
        await client.connect()
    } catch (error) {
        console.error(`Redis 错误：${err}`)
    }
    console.info("Redis 连接成功")
    return client
}()

export default redis