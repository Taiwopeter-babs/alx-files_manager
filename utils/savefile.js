import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

import dbClient from './db';

async function saveFile(data, objectToSave) {
  const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';

  return new Promise((resolve, reject) => {
    // create directory if not exists
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
    // decode data buffer to write
    const dataContent = Buffer.from(data, 'base64').toString('utf-8');

    // set filename and path
    const filename = uuidv4();
    const localPath = `${folderPath}/${filename}`;

    fs.writeFile(localPath, dataContent, async (error) => {
      if (error) {
        reject(error);
      }

      const newFile = await dbClient.saveFile({ ...objectToSave, localPath });
      resolve({ id: newFile.insertedId, ...objectToSave });
    });
  });
}

export default saveFile;
