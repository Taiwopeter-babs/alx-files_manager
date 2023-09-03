import { ObjectId } from 'mongodb';

import dbClient from '../utils/db';
import { authTokenInRedis } from '../utils/decodeAuthToken';
import saveFile from '../utils/savefile';
import publishAndUnpublish from '../utils/publishAndUnpublish';

const fileTypes = ['file', 'image', 'folder'];

class FilesController {
  /**
   * Upload a file
   * @param {request} request request object
   * @param {response} response response object
   * @returns a response
   */
  static async postUpload(request, response) {
    try {
      const userId = await authTokenInRedis(request);
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

  /**
   * gets a file based on the `id`
   * @param {*} request
   * @param {*} response
   * @returns a response object
   */
  static async getShow(request, response) {
    // get fileId and authenticate user
    const fileId = request.params.id;
    const userId = await authTokenInRedis(request);
    if (!userId) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    // get possible owner
    const owner = await dbClient.db.collection('users').findOne({ _id: new ObjectId(userId) });

    // find document based on userId and fileId
    const file = await dbClient.db.collection('files').findOne(
      {
        $and: [
          { _id: new ObjectId(fileId) },
          { userId: new ObjectId(owner._id) },
        ],
      },
      {
        projection: {
          _id: 0,
          id: '$_id',
          userId: 1,
          name: 1,
          type: 1,
          isPublic: 1,
          parentId: 1,
        },
      },
    );
    if (!file) {
      return response.status(404).json({ error: 'Not found' });
    }
    return response.status(200).json(file);
  }

  /**
   * gets files of type `image` or `file` that are linked to a folder
   * with a specific `parentId`. If the `parentId` is undefined, default is `0`.
   * The returned array is paginated based on the `page` number in the query
   * parameter. If `page` is undefined, default is 0.
   * @param {request} request request object
   * @param {response} response response object
   * @returns a response object with a json array
   */
  static async getIndex(request, response) {
    const userId = await authTokenInRedis(request);
    if (!userId) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    // check request query for parentId and page
    // regex to check for hexadecimal if string is not 0, the default parentId
    const checkDigit = /[0-9a-fA-F]{6}/g;

    let parentIdValue = request.query.parentId;

    if (parentIdValue === '0' || !parentIdValue || !checkDigit.test(parentIdValue)) {
      parentIdValue = 0;
    } else {
      parentIdValue = new ObjectId(parentIdValue);
    }
    const page = !request.query.page ? 0 : parseInt(request.query.page, 10);

    // aggregate files and paginate by page number and limit
    const limitPerPage = 20;
    const toSkip = limitPerPage * page;
    const filesInFolder = await dbClient.db.collection('files').aggregate([
      {
        $match:
        {
          $and: [
            { userId: new ObjectId(userId) },
            { parentId: parentIdValue },
            { type: { $in: ['file', 'image'] } },
          ],
        },
      },
      { $skip: toSkip },
      { $limit: limitPerPage },
      {
        $project: {
          _id: 0,
          id: '$_id',
          userId: 1,
          name: 1,
          type: 1,
          isPublic: 1,
          parentId: 1,
        },
      },
    ]).toArray();
    return response.status(200).json(filesInFolder);
  }

  /**
   * sets a file `isPublic` property to true
   * @param {*} request
   * @param {*} response
   * @returns
   */
  static async putPublish(request, response) {
    // authenticate user
    const userId = await authTokenInRedis(request);
    if (!userId) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    // find file linked to user
    const owner = await dbClient.db.collection('users').findOne({ _id: new ObjectId(userId) });
    const fileId = request.params.id;

    const updatedDoc = await publishAndUnpublish(true, fileId, owner._id);
    if (!updatedDoc) {
      return response.status(404).json({ error: 'Not found' });
    }
    return response.status(200).json(updatedDoc);
  }

  /**
   * sets a file `isPublic` attribute to true
   * @param {*} request
   * @param {*} response
   * @returns
   */
  static async putUnpublish(request, response) {
    // authenticate user
    const userId = await authTokenInRedis(request);
    if (!userId) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    // find file linked to user
    const owner = await dbClient.db.collection('users').findOne({ _id: new ObjectId(userId) });
    const fileId = request.params.id;

    const updatedDoc = await publishAndUnpublish(false, fileId, owner._id);
    if (!updatedDoc) {
      return response.status(404).json({ error: 'Not found' });
    }
    return response.status(200).json(updatedDoc);
  }
}

export default FilesController;
