var bodyParser = require('body-parser'); // this allows us to access req.body.whatever
var multer = require('multer');
var upload = multer();

const express = require('express');
const { stringify } = require('qs');
const app = express();
const port = 8080
const scraper = require('./modules/scraper.js');
const fs = require('fs');
const { resolve } = require('path');

app.set('views', './views');

// for parsing application/json
app.use(bodyParser.json()); 

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded
// app.use(express.json());       // to support JSON-encoded bodies
// app.use(express.urlencoded()); // to support URL-encoded bodies

// for parsing multipart/form-data
app.use(upload.array()); 
// SERVE STATIC FILES Now, you can load the files that are in the public directory
// app.use(express.static('public'));
app.use(express.static(__dirname)); //NODEN käynnistyssijainti - saattaa muuttua jos appin siirtää jonnekin



app.get('/', (req, res) => {
  console.log(req.body);

        // nodessa ei voi käpistellä html-tiedostoja suoraan, joten muutetaan se stringiksi
        let html = fs.readFileSync("./views/main.html").toString("utf-8");
        res.send(html); //headerit voi lähettää vain kerran, eli vain yks res.send. Res.writeja voi olla useita ja lopuksi res.send
        
        // malli miten funktion errori napataan
        // suoritaHaku().catch(e => {console.log("--------------- mitä nyt TAAS: " + e.message);})    
      })
      app.post('/', (req, res) => {
        //   POST KUTSU tuli
        // { hakusana: 'koira' } lomakkeen osis pitää olla name-attribuutit (=hakusana)
        console.log("POST KUTSU tuli");
        console.log(req.body);
        
        // käynnistää scraperin (joka palauttaa promisen), ja kun se on valmis, etenee then:illä
        scraper.getProducts(req.body.hakusana).then(x => {
          // console.log(x); // tulostaa scraperista tulleet tuotteet
          // res.send(x);
          
        let html = fs.readFileSync("./views/main.html").toString("utf-8");
        let taulukko = "";

        for (let index = 0; index < x.length; index++) {
          taulukko += `
          <div class="taulukko">
            <div class="kuvadiv"><a href="${x[index].url}" target="_blank"><img class="kuva" src="${x[index].kuva}"></a></div>
            <div class="tietodiv">
                <span class="tuotenimi">${x[index].nimi}</span><br>
                <span class="hinta">${x[index].hinta}</span><br>
                <span class="url"><a href="${x[index].url}" target="_blank">${x[index].url}</a></span><br>
                <span class="ean"><span class="palkki">Ean:</span>${x[index].ean}</span><br>
                <span class="magentoid"><span class="palkki">Magento id:</span>${x[index].magentoid}</span><br>
                <span class="kategoria"><span class="palkki">Kategoria:</span>${x[index].kategoria}</span><br>
            </div>
          </div><br>
      
          
          
          
          `;
        }

        //etsitään main.html:stä div, jonka sisältö korvataan uudella (<div class="main">TÄMÄ VÄLI KORVAUTUU</div>)
        let taydennetty = html.replace(/(?<=\<div class="main">)(.*?)(?=\<\/div>)/g, taulukko);

        x.length = 0; // tyhjennetään array seuraavaa hakua varten. Muuten vanhatki tulokset jää näkyviin.
        res.send(taydennetty);

    })
})

// app.listen(process.env.PORT || 8080) => {
  

app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
  console.log(process.env.PORT, "Herokun antama portti");
})

