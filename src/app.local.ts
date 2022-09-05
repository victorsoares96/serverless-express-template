import app from './app';
import log from './utils/log.util';

const port = 3333;

app.listen(port, () => {
  log.info(`🚀  Server started on port ${port}!`);
});
