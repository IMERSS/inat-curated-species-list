import express from 'express';
import { getBackupSettings, updateBackupSettings } from './backup-settings.js';
import { getMainSettings, updateMainSettings } from './main-settings.js';
import cors from 'cors';
import nocache from 'nocache';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(nocache());

app.get('/backup-settings', (req, res) => {
  const { exists, backupSettings } = getBackupSettings();
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ exists, backupSettings }));
});

app.post('/backup-settings', (req, res) => {
  const { success, error } = updateBackupSettings(req.body);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ success, error }));
});

app.get('/main-settings', (req, res) => {
  const settings = getMainSettings();
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ settings }));
});

app.post('/main-settings', (req, res) => {
  const { success } = updateMainSettings(req.body);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ success }));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
