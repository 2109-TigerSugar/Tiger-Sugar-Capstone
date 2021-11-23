const path = require('path');
const express = require('express');
const morgan = require('morgan');
const PORT = process.env.PORT || 8080;
const app = express();
const socketio = require('socket.io');
module.exports = app;

const createApp = () => {
  // logging middleware
  app.use(morgan('dev'));

  // body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // static file-serving middleware
  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.use(express.static(path.join(__dirname, '..', 'src')));

  app.get('/test', (req,res) => {
    res.send('text');
  })

  // sends index.html
  app.get('/', (req, res) => {

    res.sendFile(path.join(__dirname, '..', 'public/index.html'));
  });



  // any remaining requests with an extension (.js, .css, etc.) send 404
  app.use((req, res, next) => {
    if (path.extname(req.path).length) {
      const err = new Error('Not found');
      err.status = 404;
      next(err);
    } else {
      next();
    }
  });

  // error handling endware
  app.use((err, req, res, next) => {
    console.error(err);
    console.error(err.stack);
    res.status(err.status || 500).send(err.message || 'Internal server error.');
  });
};

const startListening = () => {
  // start listening (and create a 'server' object representing our server)
  const server = app.listen(PORT, () =>
    console.log(`Mixing it up on port ${PORT}`)
  );
  const io = socketio(server);
  //connect backend socket listeners for multiplayer connection
  // require('./socket')(io);
};

async function bootApp() {
  await createApp();
  await startListening();
}

bootApp();
