const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/get-price', async (req, res) => {
  const { ref, market, product } = req.query;
  if (!ref || !market || !product) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const refClean = ref.replace(/\D/g, '');
  const url = `https://www.ikea.com/${market}/fr/p/${product.toLowerCase()}-${refClean}/`;

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const price = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="product-pip-price__value"]');
      return el ? el.textContent.trim() : 'Non trouvé';
    });

    await browser.close();
    res.json({ price, link: url });
  } catch (err) {
    res.status(500).json({ price: 'Erreur', link: url });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));