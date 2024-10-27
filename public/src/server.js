const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Set static folder
app.use(express.static(path.join(__dirname, '../public')));

// Express setup
app.use(bodyParser.json());


// Express route for Telegram to send updates
/*app.post(`/bot${bot.token}`, (req, res) => {
  res.set('ngrok-skip-browser-warning', 'true');
  console.log('Response Headers:', res.getHeaders());
  bot.processUpdate(req.body);
  res.sendStatus(200);
});*/

// Start the server and set the webhook
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

//ngrok http --domain=finer-colt-tolerant.ngrok-free.app 80