const httpIncoming = require('http');
const { URL } = require('url');
const firstArg = process.argv.slice(2)[0];
const secondArg = process.argv.slice(2)[1];
const serviceUrlEntry = process.env.URL_TARGET || firstArg || 'http://localhost';
const serviceUrl = new URL(serviceUrlEntry);
const port = process.env.port || process.env.PORT || secondArg || 80;

console.log(`Proxing redirect requests to: ${serviceUrlEntry}`);
console.log(`Serving on port: ${port}`);

httpIncoming.createServer((request, response) => {
    const { headers, method, url } = request;
    let body = [];
    request.on('error', (err) => {
      console.error(err);
    }).on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString();
      //   console.log('*** headers: ' + JSON.stringify(headers));
      //   console.log('*** url: ' + url);
      //   console.log('**** body: ' + body);
      //   console.log('----------------'); 
    
      response.on('error', (err) => {
        console.error(err);
      });
  
      // Response
      // Close the browser page before complete the redirect
      // Errors should be handled on the server side
      // This app console will log errors for debugging
      response.statusCode = 200;
      response.setHeader('Content-Type', 'text/html')
      response.write('<script>window.close();</script>');
      response.end();
      console.log('*---------------');
      // END OF Response

      const proxyRedirect = function() {
        return new Promise((resolve, reject) => {
          const outgoingOptions = {
            host: serviceUrl.host,
            method: 'GET',
            path: url
          };
          console.log('--------*-------');
          const lib = require('https');
          const request = lib.request(outgoingOptions, (response) => {
            console.log(`proxyRedirect:STATUS: ${response.statusCode}`);
            response.on('data', (chunk) => console.log(`proxyRedirect:BODY: ${chunk}`));
            // we are done, resolve promise with those joined chunks
            response.on('end', () => resolve(console.log('No more data in response.')));
          });
          // handle connection errors of the request
          request.on('error', (err) => {
            console.error(`problem with request: ${err.message}`);
            reject(err)
          })
          request.end();
          console.log('---------------*');
        })
      };
    
      proxyRedirect()
      .catch((err) => console.error(err));
  
    });
  }).listen(port);