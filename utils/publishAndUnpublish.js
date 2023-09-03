import { ObjectId } from 'mongodb';
import dbClient from './db';

/**
 * Updates the `isPublic` property of a document
 * @param {topublish} topublish a boolean value to set the `isPublic`
 * @param {fileId} fileId id of document to update
 * @param {userId} userId id of document owner
 * property of a document
 */
export default async function publishAndUnpublish(topublish, fileId, userId) {
  const query = {
    $and: [
      { _id: new ObjectId(fileId) },
      { userId: new ObjectId(userId) },
    ],
  };

  const result = await dbClient.db.collection('files').findOneAndUpdate(
    query,
    { $set: { isPublic: topublish } },
    { returnDocument: 'after' },
  );
  if (!result.value) {
    return null;
  }
  const { _id, ...restOfDocument } = result.value;
  // remove localPath property from result
  delete restOfDocument.localPath;

  return { id: _id, ...restOfDocument };
}
