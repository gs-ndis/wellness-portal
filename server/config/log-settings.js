var morgan = require('morgan');
var consoleStamp = require("console-stamp");

morgan.token('combined', '[:date[iso]] [HTTP]  :remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"');

morgan.format('dev', function developmentFormatLine(tokens, req, res) {
  // get the status code if response written
  var status = res._header ? res.statusCode : undefined;

  // get status color
  var color = status >= 500 ? 31 // red
    : status >= 400 ? 33 // yellow
    : status >= 300 ? 36 // cyan
    : status >= 200 ? 32 // green
    : 0 // no color

  // get colored function
  var fn = developmentFormatLine[color];

  if (!fn) {
    // compile
    fn = developmentFormatLine[color] = morgan.compile('[:date[iso]] [HTTP]  :method \x1b[04;36m:url\x1b[0m \x1b[1;' + color + 'm:status \x1b[0m:response-time ms - :res[content-length]\x1b[0m');
  }

  return fn(tokens, req, res);
});
consoleStamp(console, {
  formatter: function() {
    return new Date().toISOString();
  }
});

