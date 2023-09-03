import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { decodeAuthHeader, authTokenInRedis } from '../utils/decodeAuthToken';

class AuthController {
  static async getConnect(request, response) {
    // get `Authorization` header and parse
    const { email, password } = await decodeAuthHeader(request);
    if (!email || !password) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    const user = await dbClient.getUser(email);
    if (!user) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    if (user.password !== sha1(password)) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    const token = uuidv4();
    const tokenKey = `auth_${token}`;

    // save key in redis with userId as the value
    await redisClient.set(tokenKey, user._id.toString(), 86400);

    return response.status(200).json({ token });
  }

  /**
   * sign out a user
   * @param {*} request
   * @param {*} response
   * @returns response
   */
  static async getDisconnect(request, response) {
    const userToken = `auth_${request.get('x-token')}`;
    const userId = await authTokenInRedis(request);

    if (!userId) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    const user = await dbClient.db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    // delete key from redis
    await redisClient.del(userToken);
    return response.status(204).send();
  }
}

export default AuthController;
