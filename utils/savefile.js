import fs from 'fs';
import mime from 'mime-types';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';

import dbClient from './db';

/**
 * ### save a file document to the database
 * @param {*} data data of uploaded document
 * @param {*} objectToSave properties of document
 * @returns promise
 */
export async function saveFile(data, objectToSave) {
  let dataContent;
  const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';

  return new Promise((resolve, reject) => {
    // create directory if not exists
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
    // decode data buffer to write
    if (objectToSave.type === 'image') {
      dataContent = Buffer.from(data, 'base64');
    } else {
      dataContent = Buffer.from(data, 'base64').toString('utf-8');
    }

    // set filename and path
    const filename = uuidv4();
    const localPath = `${folderPath}/${filename}`;

    fs.writeFile(localPath, dataContent, async (error) => {
      if (error) {
        reject(error);
      }

      const newFile = await dbClient.saveFile({ ...objectToSave, localPath });
      resolve({ id: newFile.id, ...objectToSave });
    });
  });
}

/**
 * reads the content of a file and returns its mime-type and content
 * @param {*} fileId id of file document
 * @param {*} userId id of owner
 * @param {size} size size of image thumbnail, if any
 * @returns a promise object
 */
export async function getFile(fileId, userId, size = null) {
  const file = await dbClient.db.collection('files').findOne(
    {
      $and: [
        { _id: new ObjectId(fileId) },
        { userId: new ObjectId(userId) },
      ],
    },
  );
  return new Promise((resolve, reject) => {
    // local path to read file from
    let localPath;
    // return data
    let fileData;

    if (!file) {
      reject(Error('Not found'));
    }
    // check file publish status
    if (!file.isPublic) reject(Error('Not found'));
    // folders don't have content
    if (file.type === 'folder') reject(Error('A folder doesn\'t have content'));

    /**
     * images have different widths/sizes and
     * thumbnails are returned for images if size is specified
     * Otherwise, the default file stored (file or image) is returned
     */
    if (file.type === 'image' && size) {
      localPath = `${file.localPath}_${size}`;
    } else {
      localPath = file.localPath;
    }

    // localPath property contains the file location
    fs.readFile(localPath, { encoding: 'utf-8', flag: 'r' }, (error, data) => {
      // non existing file
      if (error) {
        reject(Error('Not found'));
      }

      // get mime-type
      const fileMimeType = mime.lookup(file.name);
      // decode encoding for thumbnails
      if (size) {
        fileData = Buffer.from(data, 'base64').toString('utf8');
      } else {
        fileData = data;
      }

      resolve({ fileData, fileMimeType });
    });
  });
}

/**
 * ### save an image thumbnail to the filePath specified
 * @param {thumbnail} data thumbnail to be saved
 * @param {*} objectToSave file path to which the thumbnail will be saved
 * @returns promise
 */
export async function saveImageThumbnail(thumbnail, filePath) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, thumbnail, { flag: 'w' }, (error) => {
      if (error) {
        console.log(error);
        reject(error);
      }
      resolve();
    });
  });
}
