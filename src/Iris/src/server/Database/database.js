const mongoose = require('mongoose');
const Logger = require('../../utils/logging/Logger');

try {
  mongoose
    .connect(
    config.dbURI
    )
    .then(() => {
      Logger.INFO('Connected to Database!');
    });
} catch (err) {
  Logger.ERROR(err);
}
