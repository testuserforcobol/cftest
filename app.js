'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

const my_token = process.env.MY_TOKEN;
const access_token = process.env.ACCESS_TOKEN;

const sendTextMessage = (sender, text) => {
  const messageData = {
    text:text
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: access_token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, (error, response, body) => {
    if (error) {
      console.log('Error: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}

app.set('port', (process.env.PORT || 3000));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


app.get('/', function (req, res) {
    res.send('Hello, Facebook Messenger Bot.');
});

app.get('/webhook', (req, res) => {
    if (req.query['hub.verify_token'] === my_token) {
      res.send(req.query['hub.challenge']);
    }
  res.send('Error, wrong validation token');
});


app.post('/webhook', function (req, res) {
  let messaging_events = req.body.entry[0].messaging
  for (let i = 0; i < messaging_events.length; i++) {
    let event = req.body.entry[0].messaging[i]
    let sender = event.sender.id
    if (event.message && event.message.text) {
      let text = event.message.text
      var webclient = require('request');
      webclient({
        url: 'https://api.a3rt.recruit-tech.co.jp/talk/v1/smalltalk',
        form: { apikey: process.env.a3rt_talk_apikey, query: event.message.text },
        method: 'POST',
        json: true
      }, (err, response, body) => {
        var a3rtMsg;
        if (body.status == 0) {
            a3rtMsg = body.results[0].reply;
        } else {
            a3rtMsg = event.message.text;
        }
          sendTextMessage(sender, a3rtMsg.substring(0, 200));
      });
    }
  }
  res.sendStatus(200);
});

app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'));
});
