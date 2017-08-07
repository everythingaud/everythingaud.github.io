var Twit              = require('twit');
var async             = require('async');
var GoogleSpreadsheet = require('google-spreadsheet');
var base64Img         = require('base64-img');
var _                 = require('lodash');

var twit = new Twit({
  consumer_key:         process.env.TWITTER_CONSUMER_KEY,
  consumer_secret:      process.env.TWITTER_CONSUMER_SECRET,
  access_token:         process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

// Authenticate access to Google
function setGoogleAuth(callback) {
  // var creds = require('./client_secret.json');
  var creds = {
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCsBKT1ZpQUCHED\n4/G4YZUU+y4FFsR4Pw+14jWXY+VyilLS7jWi1pRDA0vkCoduXjGuacvF3fC64oAY\nLRiXTBp840hImnqRKmMHsgLyxH4QderT/Bu4kZ9HSlwK9Wf67uZwUNkXJqyQmqKI\n82OeopJUMK05B2iX6xXMp+5lbEl1g5YfSoG1fG3nIDL4Y3+kqw2GcM9/tB8egvmZ\n32fGhX2avoYzf67lQjS89KfTVbPu997JsG3zeyZOAYFSMyM2Pss2OJuRxGvNlymd\n3mIaXdA1X/upj/PYyall1QGX30tyC7dS1MtUDhL1thlnLbjJCnPw0ru95JuCJL2Z\noEZN5DI9AgMBAAECggEAEhak8Ac64AZpN/MCypQ8VIn7M17LByf+c25Xm1VOXeaM\nwhB5hGeTDJ7unoq65hCyobgPTP3DICvMM36efN5sVKCjy7qu09AEvNzrsXKXHQ0B\nRgxXL+fkO19m4WIf7oOrqLjfsy8Ga2hPWh5Z5ecLgx3hQUN1rK/0SWKJT5H9AYXK\nIRjqMzf+Npd5PfohmJSUdADGpivQEMfzmzuuLn/ybD1MKhEFyJbKcmy7lqkvjNCw\nGjcjZ4MrYDgEvPIk0HE38KHLd2TXUZ7hZZooWjQyZ6vJnMxo2xq0iKytgR0RPhPI\nH6Fn4udswWflhRaXpcgNgyIAMHQe9wA2tfWDSErncwKBgQDWcWCEzUgruN0osqeS\nhkVH3vlf3Qsm+K3oL34CnhkbHRzBwAcpIkrIjzKRohtTAISKIIvkhY9OEXEo99Ie\nv6/ykCzrQjaleK3CMGkLmEl+N2ze45Eyqmj2uVwNCSHKrv3f5ykSw34YzS/OdDTk\nObU+jg9tZqOX8Dm6KmFu/GKObwKBgQDNWo3VTZvdV2n+wjNVTw3JpPgbvYmW95oZ\n3BPQ/VPtGUCAQPsU+n+yHnJjCQZKWI18Q2M34rpZpJ360VQno2l7Bk3Onam4WOEL\nlOzcWstb7wvlyteO/qjs8Y71WG2pD7AX0YvBUebu0O0B79QxxFWf9ElgfStz+RG2\ng8xTanZgEwKBgCbC25VlnbP5eFBQ6qU7i+5PyXegdtGWhajAXOCQPy19d6M12JWA\n00+pQpS8XoAESfDFrUOjOKH92Rx0nxBbyavoj5X+o+4JAC9nnLUx06by0cUAEVC9\nKLfgDVl12xvNwanlGLGBkJtfC1MgAid2nuItv3Ag61UdYPHbkz0CdbYVAoGBAMWB\n9/KVH3lGzwqZS/gb/b3Yrk04AjKyWIPQuTqDvInJhNEWLqfhupndUNVR47vz6bj/\ns1kX93Wqr8uCM/ef4x7RVFqKJ6fHzENwbFQP+5GjnATbEHJXGrAyMPZmo6o8DXkL\nMOix1nQRfDMlsShglp4uvbhRC08S2md54jbEqbADAoGBAIDzXLjPObDC/uNMNjHo\nCXkyOh7d3RoXjxqQPkIOaAmwBi84KCQ71vL+2iFw/o345EgK4aHNi05tVz8yguLw\nVg3L7ohCuqBZrmLw3u09brqMv5l0t3t4lMl8rg8iBFxuYq7waB6qmBPe/judNFaV\nN61JnPXCxixEqBnM7NiMLANz\n-----END PRIVATE KEY-----\n",
    client_email: process.env.GOOGLE_CLIENT_EMAIL
   }

  doc.useServiceAccountAuth(creds, callback);
};

// Get the goolge spreadsheet
function getWorksheet(callback) {
  doc.getInfo(function(err, info) {
    console.log('Loaded doc: '+info.title+' by '+info.author.email);
    sheet = info.worksheets[0];
    callback(null, sheet);
  });
};

// Get the tweet data from the spreadsheet
function getTweet(sheet, callback) {
  sheet.getRows({
    offset: 1,
    limit: 100,
    orderby: 'col2'
  }, function( err, rows ) {
    var tweetData = chooseTweet(rows);
    callback(null, tweetData);
  });
}

// Helper function to choose an untweeted fact
function chooseTweet(rows) {
  var selectedRow = {}
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    if (row.tweeted === 'FALSE') {
      selectedRow.tweet = row.facts;
      selectedRow.media = row.media;
      row.tweeted = 'TRUE';
      row.save(() => {
        console.log('CHANGE SAVED', row.tweeted);
      });
      break;
    }
  }
  return selectedRow;
};

// Dummy tweet data
var testTweetData = function(tweetData, callback) {
  var tweetData = {
    tweet: "hello world 5"
  };
  callback(null, tweetData);
}

// Post tweet
var tweet = function(tweetData, callback) {
  if (_.isEmpty(tweetData)) {
    throw new Error("You're out of tweets to post, update the Google sheet");
  }
  if (tweetData.media !== 'FALSE') { // there is media to post
    base64Img.requestBase64(tweetData.media, function(e, res, body) {
      console.log('body', body, typeof body);
      var b64 = body.substring(body.indexOf('base64,') + 'base64,'.length - 1);
      twit.post('media/upload', { media_data: b64 }, function(err, data, resp){
        var mediaId = data.media_id_string;
        var altText = tweetData.tweet;
        var metaParams = {
          media_id: mediaId,
          alt_text: { text: altText }
        };
        twit.post('media/metadata/create', metaParams, function (err, data, resp) {
          if (err) {
            console.log('Error uploading media: ', err);
          } else {
            var params = {
              status:  tweetData.tweet,
              media_ids: [mediaId]
            };
            twit.post('statuses/update', params, function(err, data, resp) {
              callback(err, tweetData);
            });
          }
        });
      });
    });
  } else { // no media to post
    twit.post('statuses/update', { status: tweetData.tweet }, function(err, data, resp) {
      callback(err, tweetData)
    });
  }
}

var run = function() {
  async.waterfall([
    setGoogleAuth,
    getWorksheet,
    getTweet,
    tweet
  ],
  function(err, tweetData) {
    if (err) {
      console.log("There was an error posting to Twtitter: ", err);
    } else {
      console.log("Tweet successful.");
      console.log("Tweet: ", tweetData.tweet)
    }
  });
};

run();
