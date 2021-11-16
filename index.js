const express = require('express');
const critical = require('critical');
const fs = require('fs');
const app = express();
app.use(express.json({limit: '10mb'}));

app.get('/', (req, res) => {
  res.send('This is a server that generates critical CSS');
});

app.post('/', async (req, res) => {
  await fs.promises.appendFile('/tmp/critical-css', req.body.css);
  const { css, html, uncritical } = await critical.generate({
    css: '/tmp/critical-css',
    html: req.body.html,
    inline: false,
  })
  await fs.promises.unlink('/tmp/critical-css')
  res.send({
    css: css,
  });
})

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`tinybit-critical-css-server: listening on port ${port}`);
});
