/* Uses the slack button feature to offer a real time bot to multiple teams */
var Botkit = require('botkit');
var urban = require('urban');

if (!process.env.clientId || !process.env.clientSecret || !process.env.PORT) {
  console.log('Error: Specify clientId clientSecret and port in environment');
  process.exit(1);
}

var config = {}
if(process.env.MONGOLAB_URI) {
  var BotkitStorage = require('botkit-storage-mongo');
  config = {
    storage:  BotkitStorage({mongoUri: process.env.MONGOLAB_URI}),
  };
} else {
  config = {
    json_file_store: './db_slackbutton_bot/',
  };
}

var controller = Botkit.slackbot(config).configureSlackApp(
  {
    clientId: process.env.clientId,
    clientSecret: process.env.clientSecret,
    scopes: ['commands'],
  }
);

controller.setupWebserver(process.env.PORT,function(err,webserver) {
  controller.createWebhookEndpoints(controller.webserver);

  controller.createOauthEndpoints(controller.webserver,function(err,req,res) {
    if (err) {
      res.status(500).send('ERROR: ' + err);
    } else {
      res.send('Success!');
    }
  });
});

controller.on('slash_command',function(bot,message) {
  var searchTerm = message.text;
  var botMessage = '';
  var ret;

  if(!searchTerm) {
    botMessage = ":confused: Sorry, I need to know what to search for. Since you _didn't_ give me anything to work with, here's a random definition!\n\n";
    ret = urban.random();
  } else {
    ret = new urban(searchTerm);
  }

  ret.first(function( item ) {

    bot.replyPrivate( message, {
        text: botMessage,
        attachments:  [{
          'title': item.word,
          'title_link': item.permalink,
          "text": item.definition,
          "color": "#0748EA"
        }],
    });

  });

});
