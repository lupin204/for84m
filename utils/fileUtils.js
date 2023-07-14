const fs = require('fs')
const path = require('path')


/*
fs.open
r
파일을 읽기로 열며 해당 파일이 없다면 에러발생
r+
읽기/쓰기 상태로 파일을 열며 파일이 없다면 에러 발생 
w
쓰기로 파일을 열며 존재 하지 않으면 생성. 파일이 존재하면 내용을 지우고 처음부터 씀.
w+
읽기/쓰기로 열며  존재 하지 않으면 생성. 파일이 존재하면 내용을 지우고 처음부터 씀.
a
추가 쓰기로 열며 파일이 존재하지 않으면 만듬. 
a+
추가 읽기/쓰기로 열며 파일이 존재 하지 않으면 만듬. 
*/

const checkFile = (fullPath) => {
  const folderPath = fullPath.split( '/' ).slice( 0, -1 ).join( '/' );

  if (checkFolder(folderPath) === true) {
    fs.open(fullPath, 'a+', (err, data) => {
      if (err) {throw err;  }
      return data;
    })
  }
}

const checkFolder = (folderPath) => {
  const isExistsFolder = fs.existsSync(folderPath);
  if (!isExistsFolder) {
    fs.mkdirSync(folderPath)
    console.log(`[CREATED FOLDER] ${folderPath}`);
  }
  return true;
}

const isJsonString = (str) => {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
}

const isExistsFile = (folder, file) => {
  const fullPath = path.join(folder, file);
  const isExistsFile = fs.existsSync(fullPath);
  return isExistsFile;
}

module.exports = {
  checkFile: checkFile,
  isJsonString: isJsonString,
  isExistsFile: isExistsFile
}