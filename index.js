import * as cheerio from 'cheerio';
import {appendFile, readFile} from 'node:fs/promises';

async function findPdfLink() {
    const pageUrl = 'https://pub-restauracyjny.pl/';

    const response = await fetch(pageUrl);

    if (!response.ok) {
        return;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const targetDiv = $('div[data-id="8a9b3e2"]');

    if (targetDiv.length) {
        const link = targetDiv.find('a');

        if (link.length) {
            return link.attr('href');
        }
    }
}

async function appendIfNotExists(filePath, content) {
    let fileData = '';
    try {
        fileData = await readFile(filePath, 'utf8');
    } catch (err) {
        if (err.code !== 'ENOENT') {
            throw err;
        }
    }

    if (!fileData.includes(content)) {
        await appendFile(filePath, content);
    }
}

const pdfLink = await findPdfLink();
if (pdfLink) {
    await appendIfNotExists('results.txt', pdfLink + '\n');
}