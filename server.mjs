import * as path from "path";
import express from "express";
import createForest from "./app/prepare_data.mjs";

export default function startServer(dataFolder) {
    const app = express();
    const statisticsDir = path.join(dataFolder, 'statistics');
    const summaryFile = path.join(dataFolder, 'summary.txt');

    app.get('/',     (req, res) => res.sendFile(path.join(path.resolve() + '/index.html')));
    app.get('/data', (req, res) => res.json(createForest(summaryFile, statisticsDir)));
    app.use(express.static('public'));

    app.listen(3000, () => console.log('GUI running at http://localhost:3000'));
}