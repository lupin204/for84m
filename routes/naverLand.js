const express = require('express');
const https = require('node:https');
const axios = require('axios');
const cheerio = require('cheerio');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const fs = require('fs')
const path = require('path')
const database = require('../lib/firebase');
const router = express.Router();


const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDoc } = require('firebase/firestore');
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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


router.get(['/test'], async function(req, res, next) {


  const citiesRef = collection(db, "cities");

  await setDoc(doc(citiesRef, "SF"), {
      name: "San Francisco", state: "CA", country: "USA",
      capital: false, population: 860000,
      regions: ["west_coast", "norcal"] });
  await setDoc(doc(citiesRef, "LA"), {
      name: "Los Angeles", state: "CA", country: "USA",
      capital: false, population: 3900000,
      regions: ["west_coast", "socal"] });
  await setDoc(doc(citiesRef, "DC"), {
      name: "Washington, D.C.", state: null, country: "USA",
      capital: true, population: 680000,
      regions: ["east_coast"] });
  await setDoc(doc(citiesRef, "TOK"), {
      name: "Tokyo", state: null, country: "Japan",
      capital: true, population: 9000000,
      regions: ["kanto", "honshu"] });
  await setDoc(doc(citiesRef, "BJ"), {
      name: "Beijing", state: null, country: "China",
      capital: true, population: 21500000,
      regions: ["jingjinji", "hebei"] });

  res.status(200).json({'result': 'success'});
});


router.get(['/test22'], function(req, res, next) {

  getDoc(doc(db, 'users', 'user1'))
  .then((docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      console.log('JSON data retrieved from Firestore: ', data);
    } else {
      console.log('No such document!');
    }
  })
  .catch((error) => {
    console.error('Error getting JSON data: ', error);
  });

  res.status(200).json({'result': 'success'});
});





let _token = "";
let _articleList = [];
// {"3079": {"12345678": { ... } } }


// {
//   articleNo: articleNo,

// }

router.get(['/flush'], async function(req, res, next) {

  database.write(`article/3079`, {
    result: _articleList
  });
  


  res.status(200).json({'result': 'success'});
});



router.get(['/test2'], async function(req, res, next) {

  database.doc1();
  const result = await database.getDocs1();
console.log(result);
  res.status(200).json({'result': result});
});




router.get(['/token'], async function(req, res, next) {
  res.status(200).json({'token': _token});
});

router.get(['/list'], async function(req, res, next) {
  res.status(200).json({'list': _articleList});
});


router.get(['/get/:id'], async function(req, res, next) {

  // jwt token 새로 발급(만료시 갱신)
  await issueToken();

  // 아파트 고유번호 3079 :: 비산래미안
  var complexId = req.params.id;

  // 파라미터 세팅
  var realEstateTypeArr = [/*'APT',*/ 'ABY', 'AJGC', 'PRE']; // 매매 전세 월세 단기임대
  var realEstateType = realEstateTypeArr.join('%3A'); // ABYG%3AJGC%3APRE

  var areaNosArr = {
    "3079": ['1', '2', '3', '4'],
    "1234": ['1', '2', '3', '4']
  };
  var areaNos = '0';
  if (areaNosArr[complexId]) areaNos = areaNosArr[complexId].join('%3A'); // 1%3A2

  // 매물 호출
  let page = 1;
  let isMoreData = true;
  while (isMoreData) {
    console.log('여기서 호출한다 ' + page);
    let uri = `https://new.land.naver.com/api/articles/complex/${complexId}?realEstateType=${realEstateType}&tradeType=&tag=%3A%3A%3A%3A%3A%3A%3A%3A&rentPriceMin=0&rentPriceMax=900000000&priceMin=0&priceMax=900000000&areaMin=0&areaMax=900000000&oldBuildYears&recentlyBuildYears&minHouseHoldCount&maxHouseHoldCount&showArticle=false&sameAddressGroup=true&minMaintenanceCost&maxMaintenanceCost&priceType=RETAIL&directions=&page=${page}&complexNo=${complexId}&buildingNos=&areaNos=${areaNos}&type=list&order=prc`;
    isMoreData = await getComplexList(uri);
    console.log('여기서 기다린다 ' + isMoreData + "========");
    page++;

    setTimeout(() => {
      
    }, 1000);

  }


  res.status(200).json(_articleList);
   
});

async function issueToken() {
  if (!_token) { await issueJwtToken(); }

  const jsonWebToken = jwt.decode(_token);
  // { id: 'REALESTATE', iat: 1689223894, exp: 1689234694 }

  const tokenExp = jsonWebToken.exp;
  const expireTime = moment(tokenExp * 1000).format('YYYYMMDDHHmmss');
  const nowTime = moment().format('YYYYMMDDHHmmss');
  if (expireTime <= nowTime) {
    // token 만료면 새로 발급해옴
    await issueJwtToken();
  }
}

async function issueJwtToken() {
  const html = await axios.get('https://new.land.naver.com/complexes',
    {
      headers: {
        "Accept": "text/html",
        "Content-Type":" application/json",
        "Accept-Encoding": "gzip",
        "Host": "new.land.naver.com",
        "Referer": "https://land.naver.com",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-site",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.67"
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false, //허가되지 않은 인증을 reject하지 않겠다!
      })
    });

    const $ = cheerio.load(html.data);
    var text = $('script').text().replaceAll(/\n|\s/ig, '');
    var str = '{' + text.substr(text.indexOf('\"token\":\"'), text.indexOf(',')+10) + '}';
    var json = JSON.parse(str);
    _token = json['token'];
}

async function getComplexList(uri) {
  console.log('getComplexList' + uri);

      //uri: 'https://new.land.naver.com/api/articles/complex/3079?realEstateType=APT%3AABYG%3AJGC%3APRE&tradeType=B1%3AB2%3AB3&tag=%3A%3A%3A%3A%3A%3A%3A%3A&rentPriceMin=0&rentPriceMax=900000000&priceMin=0&priceMax=900000000&areaMin=0&areaMax=900000000&oldBuildYears&recentlyBuildYears&minHouseHoldCount&maxHouseHoldCount&showArticle=false&sameAddressGroup=true&minMaintenanceCost&maxMaintenanceCost&priceType=RETAIL&directions=&page=1&complexNo=3079&buildingNos=&areaNos=2%3A3%3A1%3A4&type=list&order=prc',
    //uri:  `https://new.land.naver.com/api/articles/complex/${complexId}?realEstateType=${realEstateType}&tradeType=&tag=%3A%3A%3A%3A%3A%3A%3A%3A&rentPriceMin=0&rentPriceMax=900000000&priceMin=0&priceMax=900000000&areaMin=0&areaMax=900000000&oldBuildYears&recentlyBuildYears&minHouseHoldCount&maxHouseHoldCount&showArticle=false&sameAddressGroup=true&minMaintenanceCost&maxMaintenanceCost&priceType=RETAIL&directions=&page=${page}&complexNo=${complexId}&buildingNos=&areaNos=${areaNos}&type=list&order=prc`,
    //uri: 'https://new.land.naver.com/api/complexes/8928',
    const result = await axios.get(uri,
    {
      headers: {
        "Content-Type":" application/json",
        "Accept-Encoding": "gzip",
        "Host": "new.land.naver.com",
        "Referer": "https://new.land.naver.com/complexes",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36",
        "Authorization": `Bearer ${_token}`
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false, //허가되지 않은 인증을 reject하지 않겠다!
      })
    });

    console.log(result.data);

    const json = result.data;

    _articleList = _articleList.concat(json.articleList);
    
    console.log("여기서 일단 기다린다 " + json.isMoreData);
    return json.isMoreData;


}


module.exports = router;
