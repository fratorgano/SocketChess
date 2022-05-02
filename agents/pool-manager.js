const workerpool = require('workerpool');

pool.exec('randomMove', ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'])
  .then((result) => {
    console.log(`Result: ${result}`); // outputs 55
  })
  .catch((err) => {
    console.error(err);
  });
/* .then(function () {
      console.log(pool.stats())
      pool.terminate(); // terminate all workers when done
    }); */
