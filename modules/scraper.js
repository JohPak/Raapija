
    const url = 'https://www.minimani.fi/search/?q=';
    const puppeteer = require('puppeteer');
    const $ = require('cheerio');
    let tuotteet = [];
    let tuoteObj = {
        nimi: "",
        hinta: "",
        url: "",
        kuva: "",
        ean: "",
        magentoid: "",
        kategoria: "",
        positio: ""
    }
    
    
function getProducts(searchword) {
    return new Promise((resolve) => {
            
    
    puppeteer
    .launch()
    .then(function(browser) {
        return browser.newPage();
    })
    .then(function(page) {
        console.log(url+searchword);
        return page.goto(url+searchword).then(async function() {
            await page.waitForSelector('.klevuImgWrap') // odottaa siihen saakka että hakutuloksia sisältävät divit on ladattu (class="klevuImgWrap")
            return page.content();
        });
    })
    .then(function(html) {
        
        let maara = ($(".kuName", html).length); // hakutulosten määrä (max 60, sen verran näkyy sivulla kerralla)
        
        $('#kuLandingProductsListUl > li', html).each(function(index, element) { // ETSII LI:t, joissa klevuImgWrap, kuNameDesc, kuPrice
            // tuoteObj.nimi =$(".klevuImgWrap > a > img", html)[index].attribs.alt, index; //TUOTENIMI
            tuoteObj.kuva =$(".klevuImgWrap > a > img", html)[index].attribs.src, index; //KUVAN URL
            
            haje(html, tuoteObj); // parsitaan löytyneen tuotteen tiedot ja sijoitetaan objektiin
            tuotteet.push(tuoteObj); // sijoitetaan objekti taulukkoon
            tuoteObj = {}; // luodaan uusi objekti seuraavaa tuotetta varten
            
            function haje(html, tuoteobjekti) {
                //OTERAAN RIMPSU JSONIKSI
                let jiisoni = $(".kuName > a", html)[index].attribs.onmousedown;
                // console.log(jiisoni, "PARSIMATON");
                eval('jiisoni = ' + /{.*}/g.exec(jiisoni)[0]); // jarnon hirviöhommeli, joka ottaa kaarisulkujen välisen sisällön ja muuttaa sen jsoniksi
                // console.log(jiisoni, "JIISONIKSI PARSITTU");
                tuoteobjekti.ean = jiisoni.data.sku;
                tuoteobjekti.positio = jiisoni.data.position;
                tuoteobjekti.magentoid = jiisoni.data.code;
                tuoteobjekti.hinta = jiisoni.data.salePrice + " €";
                tuoteobjekti.nimi = decode(jiisoni.data.name);
                tuoteobjekti.url = decode(jiisoni.data.url);
                tuoteobjekti.kategoria = umlaut(decode(jiisoni.data.category));
            }
            
            function decode(value) {
                try {
                    // console.log(value, "TÄSSÄ");
                    return decodeURIComponent(value); // yritetään dekoodausta
                    
                } catch (error) {
                    // console.log(error);
                    try {
                        return decodeURI(value); // jos ei onnistunut, koitetaan toista vaihtoehtoa
                    } catch (error) {
                        // console.log(error);
                        return umlaut(value); // jos kumpikaan ei onnistu, palautetaan kategorianimi sellaisenaan
                    }
                }
            }
            function umlaut(value){
                // value = value.toLowerCase();
                value = value.replace(/%AE/g, 'ä');
                value = value.replace(/%E4/g, 'ä');
                value = value.replace(/%C4/g, 'Ä');
                value = value.replace(/%e4/g, 'ä');
                value = value.replace(/%F6/g, 'ö');
                value = value.replace(/%3B/g, '-');
                value = value.replace(/%20/g, ' ');
                value = value.replace(/%2C/g, ',');
                value = value.replace(/;;/g, ', ');
                value = value.replace(/%D6/g, 'Ö');
                
                return value;
            }
        });
        
        // console.log(tuotteet);
        console.log("Haku valmis! -terveisin: scraper.js");
        // console.log(tuotteet);
        // return tuotteet; // palautetaan tuotteet sisältävä taulukko kutsujalle

    // PROMISEN JÄLKEEN LISÄTTYÄ
    console.log(tuotteet.length, " tuotetta (max. 60 hakutulosta)");
    // console.log(tuotteet);
    if (tuotteet.length > 0) {
        resolve(tuotteet);
    }



    })
    .catch(function(err) {
        //handle error
        console.error(err, "VIRHEILMOITUS scraper.js:sta");
    });



    

    }) // PROMISE END
} // GETPRODUCTS END




    module.exports.getProducts = getProducts;
