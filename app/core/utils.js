exports.each = (obj, callback) => {
  let ret = {}
  for(let i in obj){
    ret[i] = callback(obj[i], i)
  }
  return ret
}