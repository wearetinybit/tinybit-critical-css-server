import express from 'express';
import { generate } from 'critical';
import puppeteer from 'puppeteer';
import fs from 'fs';
import tmp from 'tmp';

const app = express();

app.use(express.json({limit: '10mb'}));

app.get('/', (req, res) => {
  res.send('This is a server that generates critical CSS');
});

app.post('/', async (req, res) => {
  const browser = await puppeteer.launch({
    headless: 'shell',
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
    defaultViewport: {
      width: 1300,
      height: 900
    }
  });
  const cssFile = tmp.tmpNameSync();
  const dimensions = [
    {
      height: 640,
      width: 360,
    },
    {
      height: 1300,
      width: 900,
    },
  ];
  try {
    await fs.promises.appendFile(cssFile, req.body.css);
    const { css, html, uncritical } = await generate({
      concurrency: 1, // https://github.com/addyosmani/critical/issues/364#issuecomment-493865206
      css: cssFile,
      html: req.body.html,
      inline: false,
      penthouse: {
        puppeteer: {
          getBrowser: () => browser,
        }
      }
    });
    await fs.promises.unlink(cssFile);
    res.send({
      css: css,
    });
  } catch( err ) {
    res.status(400).send(err.message);
  }
})

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`tinybit-critical-css-server: listening on port ${port}`);
});
