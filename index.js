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
	let browser;


  const cssFile = tmp.tmpNameSync();

	console.log( 'Before browser launch, CSS file:' + cssFile );

  try {
    console.log('Starting browser launch...');

    const browserLaunchPromise = puppeteer.launch({
      headless: 'new',
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
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

    // Set a timeout for browser launch
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Browser launch timed out after 30 seconds')), 30000)
    );

    browser = await Promise.race([browserLaunchPromise, timeoutPromise]);

    console.log('Browser launched successfully');

    await fs.promises.appendFile(cssFile, req.body.css);

	  console.log( 'After writing css' );

    const { css } = await generate({
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

	console.log( 'After generating critical css' );

    await fs.promises.unlink(cssFile);

	console.log( 'Sending response' );

    res.send({
      css: css,
    });
  } catch( err ) {
    res.status(400).send(err.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`tinybit-critical-css-server: listening on port ${port}`);
});
