import * as cheerio from 'cheerio';
import {appendFile, readFile, writeFile} from 'node:fs/promises';

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

    if (!fileData.includes(content.trim())) {
        await appendFile(filePath, content);
        return true;
    }

    return false;
}

async function downloadPdf(pdfUrl) {
    const response = await fetch(pdfUrl);
    if (!response.ok) {
        return;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filename = pdfUrl.split('/')
        .filter(Boolean)
        .slice(-3)
        .join('_');

    await writeFile(`pdfs/${filename}`, buffer);
}

const pdfLink = await findPdfLink();
if (pdfLink) {
    const wasAppended = await appendIfNotExists('results.txt', pdfLink + '\n');

    if (wasAppended) {
        await downloadPdf(pdfLink);
    }
}
