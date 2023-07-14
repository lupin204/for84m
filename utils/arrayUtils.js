const findAndRemove = (array, key, value) => {
  array.forEach(function(result, index) {
    if(result[key] === value) {
      //Remove from array
      array.splice(index, 1);
    }    
  });
}

module.exports = {
  findAndRemove: findAndRemove
}