import express from 'express';
import { getBackupSettings, updateBackupSettings } from './backup-settings.js';
import { getMainSettings, updateMainSettings } from './main-settings.js';
import { getBaselineSpecies, updateBaselineSpecies } from './baseline-species.js';
import cors from 'cors';
import nocache from 'nocache';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
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

app.get('/baseline-species', (req, res) => {
  const data = getBaselineSpecies();
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ data }));
});

app.post('/baseline-species', (req, res) => {
  const { success, error } = updateBaselineSpecies(req.body);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ success, error }));
});

app.post('/species-counts', (req, res) => {});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
