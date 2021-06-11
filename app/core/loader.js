const path = require('path')
const { stat , readdir } = require('fs/promises')

const createClass = (app , mix) => {
  return {
    app:app,
    config:app.config,
    ...mix
  }
  return class {
    constructor(){
      this.app = app
      this.config = app.config

      for(let i in mix){
        this[i] = mix[i]
      }
    }
  }
}

const loadBase = async (app, mod, wrap = false) => {
  const mods = await readdir(path.join(app.appInfo.baseDir, mod))
  const maps = {}
  for (let i of mods) {
    let filepath = path.join(app.appInfo.baseDir, mod,i)
    let file
    try{ file = await stat(filepath)}catch(e){console.log(e)}
    if( file.isFile() ){
      let instance = loadFile(filepath)
      let name = path.basename(i,'.js')
      //if( typeof instance === 'function' ){
        //maps[name] = instance(app)
      //}else{
      if( wrap ){
        maps[name] = createClass(app, instance)
      }else{
        maps[name] = instance
      }
      //}
    }else if( file.isDirectory() ){
      let name = path.basename(i)
      //maps[name] = await loadBase(app,path.join(mod,i))
    }
  }
  return maps
}

const isPkg = name => /^[a-z]/i.test(name)

const loadFile = (filepath) => {
  return require(filepath)
}

exports.loadBase = loadBase
exports.loadFile = loadFile
