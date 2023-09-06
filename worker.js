import Queue from 'bull';
import { ObjectId } from 'mongodb';
import imageThumbnail from 'image-thumbnail';

import dbClient from './utils/db';
import { saveImageThumbnail } from './utils/savefile';

/**
 * ### add job to queue `fileQueue`
 * @param {job} job job to be added; an object with
 * properties `userId` and `fileId`
 */
export async function addJobToQueue(job) {
  // create a queue
  const fileQueue = new Queue('fileQueue');
  await fileQueue.add(job);
}

/**
 * ### add job to `userQueue`
 * @param {job} job job to be added; with property userId
 */
export async function addJobToUserQueue(job) {
  const userQueue = new Queue('userQueue');
  await userQueue.add(job);
}

/**
 * ### process jobs in queues; generates image thumbnails with widths
 * ### `500`, `250`, and `100` and saves them to `localPath_<width>`
 * @param {job} job job to be added and processed; an object with
 * properties `userId` and `fileId`
 */
async function processFileJobs() {
  const fileQueue = new Queue('fileQueue');
  // process jobs in queue;
  fileQueue.process(async (job, done) => {
    // validate job
    if (!job.data.fileId) throw new Error('Missing fileId');
    if (!job.data.userId) throw new Error('Missing userId');

    // check if file exists
    const file = await dbClient.db.collection('files').findOne(
      {
        $and: [
          { _id: new ObjectId(job.data.fileId) },
          { userId: new ObjectId(job.data.userId) },
        ],
      },
    );
    if (!file) throw new Error('File not found');

    // Generate thumbnails for images
    const sizes = [500, 250, 100];

    // generate thumbnails of different sizes
    for await (const size of sizes) {
      // generate thumbnail
      const thumbnail = await imageThumbnail(file.localPath,
        { width: size, responseType: 'base64', jpegOptions: { force: true } });
      // save thumbnail to path
      await saveImageThumbnail(thumbnail, `${file.localPath}_${size}`);
    }
    done();
  });
}

async function processUserJobs() {
  const userQueue = new Queue('userQueue');

  userQueue.process(async (job, done) => {
    // validate job data
    if (!job.data.userId) throw new Error('Missing userId');

    // check if user exists
    const user = await dbClient.db.collection('users').findOne(
      { _id: new ObjectId(job.data.userId) },
    );
    if (!user) throw new Error('User not found');

    console.log(`Welcome ${user.email}`);
    done();
  });
}

processFileJobs();
processUserJobs();
