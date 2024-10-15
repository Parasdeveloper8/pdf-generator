const express = require("express");

const puppeteer = require('puppeteer');

const dotenv = require("dotenv").config;

const fs = require("fs");

const path = require('path');

const app = express();

const multer = require("multer"); 

const ejs = require("ejs");

app.use(express.urlencoded({ extended: false }));

const port = 8000;

app.set("view engine", "ejs");

app.set("views", "./views");

// Serve static files
app.use(express.static('public'));

app.use('/uploads', express.static('uploads'));

app.get("/", (req, res) => {
    res.render("index");
});

// Set up Multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.post('/generate', upload.single('profileImage'), async (req, res) => {
    // Extract form data
    const { name, email, age, about, address, skills, primary, secondary, seniors, college, fontSize, color } = req.body;
    
    // Font size for the HTML content
    const pxfont = fontSize + "px";

    // Construct image URL for the profile image
    const profileImagePath = req.file ? `http://localhost:8000/uploads/${req.file.filename}` : null;

    try {
        // Launch Puppeteer in headless mode
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        
        const page = await browser.newPage();

        // HTML content to be converted to PDF
        const htmlContent = `
              <!DOCTYPE html>
              <html lang="en">
              <head>
              <title>Resume</title>
              <style>
              body {
                width: 100vw;
                overflow-x: hidden;
                font-family: system-ui;
                font-size: ${pxfont};
                color: ${color};
              }
              h1 {
                text-align: center;
              }
              img {
                display: block;
                margin: 0 auto;
                max-width: 100px;
              }
              </style>
              </head>
              <body>
              <h1>My Resume</h1>
              ${profileImagePath ? `<img src="${profileImagePath}" alt="Profile Image" />` : ''}
              <p><b>Name:</b> ${name}</p>
              <p><b>Email:</b> ${email}</p>
              <p><b>Age:</b> ${age}</p>
              <fieldset>
              <legend><b>About me</b></legend>
              <p>${about}</p>
              </fieldset>
              <p><b>My address:</b> ${address}</p>
              <fieldset>
              <legend>My education</legend>
              <p><b>Primary education:</b> ${primary}</p>
              <p><b>Secondary education:</b> ${secondary}</p>
              <p><b>Senior secondary education:</b> ${seniors}</p>
              <p><b>College education:</b> ${college}</p>
              </fieldset>
              <p><b>My skills:</b> ${skills}</p>
              </body>
              </html>
        `;

        // Load the HTML content in Puppeteer
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // Generate and save the PDF
        const pdfPath = path.join(__dirname, 'output.pdf');
        await page.pdf({ path: pdfPath, format: 'A4' });

        // Close the browser
        await browser.close();

        // Set headers and send the generated PDF as a response
        res.setHeader('Content-Type', 'application/pdf');
        
        res.setHeader('Content-Disposition', 'attachment; filename=generated.pdf');

        // Send the PDF file
        const pdfBuffer = await fs.promises.readFile(pdfPath);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
