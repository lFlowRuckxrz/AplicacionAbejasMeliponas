process.on('exit', c => console.log('EXITING WITH', c));
process.on('uncaughtException', e => console.log('EXC', e));
console.log('START');
try {
  require('./routes/auth');
  console.log('AUTH REQUIRED');
  const e = require('express')();
  e.listen(5003, () => console.log('LISTENING 5003'));
} catch (err) {
  console.log('ERR', err);
}
