import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  /**
   * creates a new user
   */
  static async postNew(request, response) {
    const [email, password] = [request.body.email, request.body.password];
    // validate input
    if (!email) {
      return response.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return response.status(400).json({ error: 'Missing password' });
    }
    // check email existence
    const user = await dbClient.getUser(email);
    if (user) {
      return response.status(400).json({ error: 'Already exist' });
    }
    const hashedPwd = sha1(password);
    const newUser = await dbClient.saveUser(email, hashedPwd);

    return response.status(201).json({ id: newUser.insertedId, email });
  }

  static async getMe(request, response) {
    const userToken = `auth_${request.get('x-token')}`;
    const userId = await redisClient.get(userToken);

    if (!userId) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    const user = await dbClient.db.collection('users').findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    return response.status(200).json({ id: user._id, email: user.email });
  }
}

export default UsersController;
