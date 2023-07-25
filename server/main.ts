import server from 'server';

server().then(({ start }) => start(({ log }, err) => {
  if (err) {
    log.error(err);
    process.exit(1);
  }
}));
