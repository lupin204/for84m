import { initializeApp } from "firebase/app";
import { getDatabase, ref, update, onValue, push, child } from "firebase/database";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAkYAxaSTB8GtGATxJnanCj30l7go71bGc",
  authDomain: "for84m2.firebaseapp.com",
  databaseURL: "https://for84m2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "for84m2",
  storageBucket: "for84m2.appspot.com",
  messagingSenderId: "579314809284",
  appId: "1:579314809284:web:1dc4d16ec1d725a10d0c91",
  measurementId: "G-NYWQ4DRWGZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get "Realtime Database"
const database = getDatabase(app);



const read = (path, callback) => {
  database.ref('aaa')
  .set({name: 'bbb'}, (error) => {
    if (error) {
      console.error(error);
    } else {
      console.log('success save');
    }
  })
  return 
}



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
