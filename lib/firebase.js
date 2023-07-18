const { initializeApp } = require("firebase/app")
const { getDatabase, ref, update, onValue, push, child } = require("firebase/database");
const {set, doc, getDocs} = require('firebase/firestore');

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
const db = getDatabase(app);



// const read1 = (path, callback) => {
//   database.ref('aaa')
//   .set({name: 'bbb'}, (error) => {
//     if (error) {
//       console.error(error);
//     } else {
//       console.log('success save');
//     }
//   })
//   return 
// }

const read = (path, callback) => {
  const _ref = ref(db, path);
  return onValue(_ref, (snapshot) => {
      callback(snapshot.val());
  });
}

const write = (path, data) => {
  const key = push(child(ref(db), path)).key;
  const updates = {};
  updates[`/${path}/${key}`] = { key, ...data};
  update(ref(db), updates);
}

const updateByPath = (path, data) => {
  const key = push(child(ref(db), path)).key;
  const updates = {};
  updates[`${path}`] = data;
  update(ref(db), updates);
}

const readOnce = (path, callback) => {
  const _ref = ref(db, path);
  return onValue(_ref, (snapshot) => {
      callback(snapshot.val());
  }, {
      onlyOnce: true
  });
}

const toList = (data) => {
  return Object.keys(data || {}).map(key => data[key]);
}

const toListWithKey = (data) => {
  return Object.keys(data || {}).map(key => ({ key, ...data[key] }));
}


module.exports = {
  read: read,
  write: write,
  updateByPath: updateByPath,
  readOnce: readOnce,
  toList: toList,
  toListWithKey: toListWithKey,
  writeUserData : function (userId) {
    set(ref(db, 'users/' + userId), {
      username: 'aaa',
      email: 'bbb',
      profile_picture : 'ccc'
    });
  },
  doc1: function () {
    doc(db, 'project01', 'afasdfasdf');
  },
  getDocs1: async function() {
    await getDocs(collection(db, 'bucket'));
  }
}
