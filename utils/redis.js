import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.redisClient = createClient();
    this.redisClient.on('error', (error) => {
      console.log(`Connection to redis failed: ${error}`);
    }).on('connect', () => {
      console.log('Connected to redis server');
    });
  }

  /**
   * returns a boolean depending on the connection result
   * @returns true on successful connection, otherwise false
   */
  isAlive() {
    if (this.redisClient.connected) {
      return true;
    }
    return false;
  }

  /**
   * gets the value of a key from the redis storage
   * @param {keyString} keyString key of value to get from redis
   * @returns value from redis
   */
  async get(keyString) {
    const promiseGet = promisify(this.redisClient.get).bind(this.redisClient);
    const value = await promiseGet(keyString);
    return value;
  }

  /**
   * sets a key and value with expiry time in redis
   * @param {key} key key
   * @param {value} value value of key
   * @param {duration} duration expiration period (in seconds)
   */
  async set(key, value, duration) {
    const promiseSet = promisify(this.redisClient.set).bind(this.redisClient);
    await promiseSet(key, value, 'EX', duration.toString());
  }

  /**
   * deletes a key from redis
   * @param {keyString} keyString key to delete
   */
  async del(keyString) {
    const promiseDel = promisify(this.redisClient.del).bind(this.redisClient);
    await promiseDel(keyString);
  }
}

const redisClient = new RedisClient();
export default redisClient;
