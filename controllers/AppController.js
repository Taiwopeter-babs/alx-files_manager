import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AppController {
  /**
   * gets status of redis and mongodb databases
   * @param {*} request request object
   * @param {*} response response object
   */
  static getStatus(request, response) {
    if (dbClient.isAlive() && redisClient.isAlive()) {
      return response.status(200).json({ redis: true, db: true });
    }
    if (!dbClient.isAlive() && !redisClient.isAlive()) {
      return response.status(200).json({ redis: false, db: false });
    }
    if (!dbClient.isAlive()) {
      return response.status(200).json({ redis: true, db: false });
    }
    return response.status(200).json({ redis: true, db: false });
  }

  /**
   * gets the count of users and files
   */
  static async getStats(request, response) {
    const [nbFiles, nbUsers] = await Promise.all([dbClient.nbFiles(), dbClient.nbUsers()]);
    return response.status(200).json({ users: nbUsers, files: nbFiles });
  }
}

export default AppController;
