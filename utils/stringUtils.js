
const setComma = (num) => {
  if(num == undefined) val = '0';
  num += '';
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}



module.exports = {
  setComma: setComma
}