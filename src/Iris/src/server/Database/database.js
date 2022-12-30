const mongoose = require('mongoose');
const Logger = require('../../utils/logging/Logger');

try {
  mongoose
    .connect(
      'mongodb+srv://Packet:packetcool22@cluster0.uu2fq13.mongodb.net/Iris?retryWrites=true&w=majority'
    )
    .then(() => {
      Logger.INFO('Connected to Database!');
    });
} catch (err) {
  Logger.ERROR(err);
}
