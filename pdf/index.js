const express = require('express')
const puppeteer = require("puppeteer");
const bodyParser = require("body-parser");
const app = express()
const port = process.env.PORT || 8087;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const DEFAULT_OPTIONS = {
  format: "A4",
  margin: 0,
};

const renderFromHtml = async (html, options) => {
  const { browser, page } = await getBrowserAndPage(options);
  await page.setContent(html, options?.navigation ?? {});
  const pdfOptions = options ?? {};
  const buffer = await page.pdf({
    ...DEFAULT_OPTIONS,
    ...pdfOptions,
  });

  await browser.close();

  return buffer;
};

const getBrowserAndPage = async (options) => {
  const browser = await puppeteer.launch(options?.launch ?? {});
  const page = await browser.newPage();

  if (options?.emulateMedia) {
    await page.emulateMediaType(options.emulateMedia);
  }

  return { browser, page };
};

app.use(express.static(__dirname + "/public"));

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.post('/render', async (req, res) => {
  try {
    const buffer = await renderFromHtml(
      req.body.html.replace(
        /http(.*?)\/css\/style\.css/,
        'https://app-a2524146-ef53-4802-9027-80e4e0e79565.cleverapps.io/style.css'
        // 'http://localhost:8087/style.css'
      ), req.body.options || {});
    console.log(req.body.html);
    console.log(buffer);
    res.contentType("application/pdf");
    res.setHeader("Content-Dispositon", 'inline; filename="test.pdf"');
    res.set("Cache-Control", "public, max-age=1");
    res.send(buffer);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
