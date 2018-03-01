# SYDE322

Application exercise that performs boolean expression simplification.

# How to run?

- Install http-server by `npm install http-server -g`
- Go to directory that contains the `myscript.html` file
- Run `http-server start`, you should see the output showing server status and port number (for example, `http://127.0.0.1:8081`)
- Start the node.js server either by `node server.js` from directory that contains `server.js`, or `npm start` from the directory that contains `package.json`
- Go to link `http://localhost:8081/myscript.html`, `8081` can be replaced by port that your http server is listening on

- (If Chrome gives any CORS errors, re-run Chrome with `open -a Google\ Chrome --args --disable-web-security --user-data-dir` for testing)
