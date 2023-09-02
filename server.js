import express from 'express';
import router from './routes/index';

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const app = express();

app.use(express.json());
// load routes
app.use('/', router);
app.use('/', router);

app.listen(port, () => {
  console.log(`Listening on server port ${port}`);
});
