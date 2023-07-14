const mongoose = require('mongoose');
require('dotenv').config();

/*
mongodb://lupin204:<dbpassword>@ds229458.mlab.com:29458/coinbalance
*/

const mlab_info = process.env.MLAB_MONGO_INFO;


module.exports = () => {
  function connect() {
    mongoose.connect(mlab_info, { useNewUrlParser: true }, function(err) {
      if (err) {
        console.error('mongodb connection error', err);
      }
      console.log('mongodb connected');
    });
  }
  connect();
  mongoose.connection.on('disconnected', connect);
};
