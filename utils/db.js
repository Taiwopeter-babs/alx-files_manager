import { MongoClient } from 'mongodb';

// set up url
const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || '27017';
const url = `mongodb://${host}:${port}`;
const dbName = process.env.DB_DATABASE || 'files_manager';

class DBClient {
  constructor() {
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.client.connect()
      .then(() => {
        console.log('Connected to mongodb server');
        this.db = this.client.db(dbName);
      }).catch((error) => {
        console.log(error);
      });
  }

  isAlive() {
    if (this.client.isConnected()) return true;
    return false;
  }

  /**
   * returns the number of documents in `users` collection
   */
  async nbUsers() {
    const totalDocuments = await this.db.collection('users').countDocuments();
    return totalDocuments;
  }

  /**
   * returns the number of documents in `files` collection
   */
  async nbFiles() {
    const totalDocuments = await this.db.collection('files').countDocuments();
    return totalDocuments;
  }

  /**
   * gets a user from the database
   * @param {userEmail} userEmail user's email
   */
  async getUser(userEmail) {
    // const projectOptions = { projection: { _id: 0, id: '$_id', email: 1 } };
    const user = await this.db.collection('users').findOne({ email: userEmail });
    return user;
  }

  async saveUser(email, password) {
    const result = await this.db.collection('users').insertOne({ email, password });
    return result;
  }

  async saveFile(objectToSave) {
    const newFile = await this.db.collection('files').insertOne(objectToSave);
    const result = { id: newFile.insertedId, ...objectToSave };
    return result;
  }
}

const dbClient = new DBClient();
export default dbClient;
