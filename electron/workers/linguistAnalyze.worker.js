import * as fs from 'node:fs/promises';
import { parentPort, workerData } from 'node:worker_threads';
import { analyzeFolder } from '../utils/linguist';
async function run() {
    const { folderPath } = workerData;
    try {
        parentPort?.postMessage({ type: 'progress', stage: 'start' });
        // 轻量校验，避免主线程重复 IO
        parentPort?.postMessage({ type: 'progress', stage: 'checking' });
        const stat = await fs.stat(folderPath);
        if (!stat.isDirectory())
            throw new Error('Provided path is not a directory');
        parentPort?.postMessage({ type: 'progress', stage: 'analyzing' });
        const result = await analyzeFolder(folderPath);
        parentPort?.postMessage({ type: 'result', result });
        parentPort?.postMessage({ type: 'progress', stage: 'done' });
    }
    catch (e) {
        parentPort?.postMessage({ type: 'error', error: e?.message || String(e) });
    }
}
run();
