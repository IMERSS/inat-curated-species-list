import express from 'express';
import { getMainConfig, updateMainConfig } from './main-config.js';
import cors from 'cors';
import nocache from 'nocache';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(nocache());

app.get('/main-config', (req, res) => {
  const { exists, config } = getMainConfig();
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ exists, config }));
});

app.post('/main-config', (req, res) => {
  const { success, error } = updateMainConfig(req.body);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ success, error }));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
