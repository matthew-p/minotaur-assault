var http = require("http");
var fs = require("fs");
var mime = require("mime");

var methods = Object.create(null);

var server = http.createServer(function(request, response) { // start server
  function respond(code, body, type) { // function to call on each request
    if (!type) type = "text/plain"; // if no type given from method, default plaintext, used for error messages
    response.writeHead(code, {"Content-Type": type}); // header for response
    if (body && body.pipe) // if content streamable,
      body.pipe(response); // stream it to client
    else
      response.end(body);
  }
  if (request.method in methods) // if request is in permitted methods object
    // call the method, with request path, passing thru resp, requ arguments
    methods[request.method](urlToPath(request.url), respond, request);
  else // error out if not permitted method for the path
    respond(405, "Method " + request.method + " not allowed");
});
server.listen(8000);

function urlToPath(url) { // convert request path to decoded special characters
  var path = require("url").parse(url).pathname;
  return "." + decodeURIComponent(path); // unsecure
};

methods.GET = function(path, respond) {
  fs.stat(path, function(error, stats) { // check status of the file w. callback
    if (error && error.code == "ENOENT")
      respond(404, "File not found"); // note access to function b/c called in scope
    else if (error)
      respond(500, error.toString());
    else if (stats.isDirectory())
      fs.readdir(path, function(error, files) {
        if (error)
          respond(500, error.toString());
        else
          respond(200, files.join("\n")); // ls files returned in array of names
      });
    else
      // call respond method, read file contents to stream, lookup file type
      respond(200, fs.createReadStream(path), mime.lookup(path));
  });
}
