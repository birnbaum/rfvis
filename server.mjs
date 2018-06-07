import * as path from "path";
import express from "express";
import createForest from "./prepare_data.mjs";

const app = express();

if(process.argv.length !== 3) {
    throw 'Usage: node server.mjs <data_folder>';
}

const statisticsDir = process.argv[2] + '/statistics';
const summaryFile = process.argv[2] + '/summary.txt';

app.get('/',     (req, res) => res.sendFile(path.join(path.resolve() + '/index.html')));
app.get('/data', (req, res) => res.json(createForest(summaryFile, statisticsDir)));
app.use(express.static('public'));

app.listen(3000, () => console.log('Example app listening on port 3000!'));