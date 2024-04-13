const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());


app.get('/fetchData', async (req, res) => {
    try {
      const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
      const data = response.data;
  
      console.log('Fetched data:', data); 
  
      const top10Data = Object.values(data).slice(0, 10).map(item => ({
        name: item.name,
        last: item.last,
        buy: item.buy,
        sell: item.sell,
        volume: item.volume,
        base_unit: item.base_unit
      }));
  
      console.log('Extracted data:', top10Data); 
      //await storeDataInDatabase(top10Data);
  
      res.json({ success: true, message: 'Data fetched and stored successfully.', data: top10Data});
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch data.' });
    }
  });
  app.get('/getDataFromDB', async (req, res) => {
    try {
      const data = await Ticker.find().limit(10); 
      
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error fetching data from database:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch data from database.' });
    }
  });

async function storeDataInDatabase(data) {
  try {
    await mongoose.connect('mongodb://localhost:27017/wazirx_data', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const tickerSchema = new mongoose.Schema({
      name: String,
      last: Number,
      buy: Number,
      sell: Number,
      volume: Number,
      base_unit: String
    });

    const Ticker = mongoose.model('Ticker', tickerSchema);

    await Ticker.insertMany(data);

    console.log('Data stored in the database.');
  } catch (error) {
    console.error('Error storing data in database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
