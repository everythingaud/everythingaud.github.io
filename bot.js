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
    private_key: process.env.GOOGLE_PRIVATE_KEY,
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
