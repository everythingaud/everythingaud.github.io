var Client  = require('node-rest-client').Client;
var Twit    = require('twit');
var async   = require('async');

var twit = new Twit({
  consumer_key:         process.env.TWITTER_CONSUMER_KEY,
  consumer_secret:      process.env.TWITTER_CONSUMER_SECRET,
  access_token:         process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET
});

//dummy tweet data
var testTweetData = function(callback) {
  var tweetData = {
    tweet: "hello world"
  };
  callback(null, tweetData);
}

//get twit to post our tweet
var tweet = function(tweetData, callback) {
  twit.post('statuses/update', { status: tweetData.tweet }, function(err, data, response) {
    console.log(data);
    callback(err, tweetData)
  });
}



var run = function() {
  async.waterfall([
    testTweetData,
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
// Run function run every hour.
// setIterval(function() {
//   try {
//     run();
//   }
//   catch (err) {
//     console.log(err)
//   }
// }, 1000 * 60 * 60)
