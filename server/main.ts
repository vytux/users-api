import server from 'server';

// Starts the api http server
server().then(({ start }) => start(({ log }, err) => {
  if (err) {
    log.error(err);
    process.exit(1);
  }
}));
