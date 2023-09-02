import { ObjectId } from 'mongodb';

import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import saveFile from '../utils/savefile';

const fileTypes = ['file', 'image', 'folder'];

class FilesController {
  static async postUpload(request, response) {
    try {
      const userToken = `auth_${request.get('x-token')}`;
      const userId = await redisClient.get(userToken);
      if (!userId) {
        return response.status(401).json({ error: 'Unauthorized' });
      }
      const owner = await dbClient.db.collection('users').findOne({ _id: new ObjectId(userId) });
      // get data from client
      const {
        name, type, parentId, isPublic, data,
      } = request.body;

      // validate input
      if (!name) return response.status(400).json({ error: 'Missing name' });
      if (!type || fileTypes.indexOf(type) === -1) {
        return response.status(401).json({ error: 'Missing type' });
      }
      if (!data && type !== 'folder') {
        return response.status(400).json({ error: 'Missing data' });
      }
      // validate parent of file
      let parentFile;
      if (parentId) {
        parentFile = await dbClient.db.collection('files').findOne({ _id: new ObjectId(parentId) });
        if (!parentFile) {
          return response.status(400).json({ error: 'Parent not found' });
        }
        if (parentFile.type !== 'folder') {
          return response.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      // object
      const toSave = {
        userId: owner._id,
        name,
        type,
        parentId: parentFile ? parentFile._id : 0,
        isPublic: isPublic !== undefined,
      };

      // save file of type `folder`
      if (type === 'folder') {
        const newFile = await dbClient.db.collection('files').insertOne(toSave);
        return response.status(201).json({ id: newFile.insertedId, ...toSave });
      }
      // save file of type `file||image` to file
      const newFileInfo = await saveFile(data, toSave);
      return response.status(201).json(newFileInfo);
    } catch (error) {
      return response.status(400).json({ error: 'Unauthorized' });
    }
  }
}

export default FilesController;
