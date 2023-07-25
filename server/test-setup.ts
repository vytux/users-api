import server from 'server';

let stop: () => void;

before(async () => {
  const result = await server();
  stop = result.stop;
  await new Promise((resolve) => result.start(resolve));
});

after(async () => {
  await stop();
});
