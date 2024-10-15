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
    const { name, email, age, about, address, skills, primary, secondary, seniors, college,fontSize,color } = req.body;
    const pxfont = fontSize + "px";
    try {
        // Launch headless browser
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });

        // Create a new page
        const page = await browser.newPage();

        // Set your HTML content and wait for the page to load
        const htmlContent = `
              <!DOCTYPE html>
              <html lang="en">
              <head>
              <title>Resume</title>
              <style>
              body{
                width:100vw;
                overflow-x:hidden;
                font-family:system-ui;
                font-size:${pxfont};
                color:${color};
              }
              h1{
              text-align:center;
              }
              </style>
              </head>
              <body>
              <h1>My resume</h1>
              <p><b>Name : </b>${name}</p>
              <p><b>Email : </b> ${email}</p>
              <p><b>Age : </b>${age}</p>
              <fieldset>
              <legend><b>About me</b></legend>
              <p>${about}</p>
              </fieldset>
              <p><b>My address</b> : ${address}</p>
              <fieldset>
              <legend>My education</legend>
              <p><b>Primary education :</b>${primary}</p>
              <p><b>Secondary education :</b>${secondary}</p>
              <p><b>Senior secondary education :</b>${seniors}</p>
              <p><b>College education :</b>${college}</p>
              </fieldset>
              <p><b>My skills</b> : ${skills}</p>
              </body>
              </html>
        `;

        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

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
