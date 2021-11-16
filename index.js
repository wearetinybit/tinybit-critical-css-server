const express = require('express');
const critical = require('critical');
const fs = require('fs');
const tmp = require('tmp');
const app = express();
app.use(express.json({limit: '10mb'}));

app.get('/', (req, res) => {
  res.send('This is a server that generates critical CSS');
});

app.post('/', async (req, res) => {
  const cssFile = tmp.tmpNameSync();
  await fs.promises.appendFile(cssFile, req.body.css);
  const { css, html, uncritical } = await critical.generate({
    css: cssFile,
    html: req.body.html,
    inline: false,
  })
  await fs.promises.unlink(cssFile)
  res.send({
    css: css,
  });
})

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`tinybit-critical-css-server: listening on port ${port}`);
});
