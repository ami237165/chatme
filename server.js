// // server.js
// const fs = require("fs");
// const path = require("path");
// const https = require("https");
// const next = require("next");

// const port = parseInt(process.env.PORT, 10) || 3000;
// const dev = process.env.NODE_ENV !== "production";
// const app = next({ dev });
// const handle = app.getRequestHandler();

// // Load your SSL certificate and key
// const httpsOptions = {
//   key: fs.readFileSync(path.join(__dirname, "ssl", "key.pem")),
//   cert: fs.readFileSync(path.join(__dirname, "ssl", "cert.pem")),
// };

// app.prepare().then(() => {
//   https
//     .createServer(httpsOptions, (req, res) => {
//       handle(req, res);
//     })
//     .listen(port, () => {
//       console.log(`✅ Server ready at https://localhost:${port}`);
//     });
// });
