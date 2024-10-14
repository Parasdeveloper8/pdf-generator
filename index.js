const express = require("express");
const puppeteer = require('puppeteer');
const fs = require("fs");
const app = express();
const ejs = require("ejs");
app.use(express.urlencoded({ extended: false }));
const port = 8000;
app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/", (req, res) => {
    res.render("index");
});

app.post('/generate', async (req, res) => {
    const { name, email,age,about } = req.body;
    try {
        // Launch headless browser
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });

        // Create a new page
        const page = await browser.newPage();

        // Set your HTML content
        await page.setContent(`
              <!DOCTYPE html>
              <html lang="en">
              <head>
              <title>Resume</title>
              </head>
              <body>
              <p>My name is ${name}</p>
              <p>My email is ${email}</p>
              <p>My age is ${age}</p>
              <p>${about}</p>
              </body>
              </html>
        `);

        // Generate the PDF and save it to a temporary file
        const pdfPath = 'output.pdf';
        await page.pdf({ path: pdfPath, format: 'A4' });

        // Close the browser
        await browser.close();

        // Set the response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=generated.pdf');

        // Read the PDF file and send it as a response
        const pdfBuffer = await fs.promises.readFile(pdfPath);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
