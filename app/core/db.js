const path = require('path');
const os = require('os');
const fs = require('fs');
const writeFileAtomic = require('write-file-atomic');

const mkdir = function(p) {
  if (fs.existsSync(p) == false) {
    mkdir(path.dirname(p));
    fs.mkdirSync(p);
  }
};

const base64 = {
  encode: (v) => Buffer.from(v).toString('base64'),
  decode: (v) => Buffer.from(v, 'base64').toString()
}

const merge = function(dst , src) {
  for (let key in src) {
    if (!(key in dst)) {
      dst[key] = src[key];
      continue;
    }else{
      if (typeof src[key] == 'object' || Array.isArray(src[key])) {
        merge(dst[key], src[key]);
      }else{
        dst[key] = src[key]
      }
    }
  }
  return dst
}

const getData = (path, options) => {
  try {
    let data = fs.readFileSync(path, 'utf8');

    if (!options.raw) {
      data = base64.decode(data)
    }

    return JSON.parse(data);
  } catch (error) {
    //if it doesn't exist or permission error
    if (error.code === 'ENOENT' || error.code === 'EACCES') {
      return {};
    }

    //invalid JSON
    if (error.name === 'SyntaxError') {
      writeFileAtomic.sync(this.path, '');
      return {};
    }

    throw error;
  }
}

const setData = (path,options, value) => {
  try {
    mkdir(path.dirname(path));

    value = JSON.stringify(value);
    if (!this.options.raw) {
      value = base64.encode(value)
    }

    writeFileAtomic.sync(this.path, value);
  } catch (error) {
    throw error;
  }
}

const reactive = (path , options = { raw: false }, defaults = {}) => {

  let data = merge(defaults, getData(path,options))

  const save = () => setData(path, options, data)

  return new Proxy(data, {
    get(target, key, receiver){
      const obj = Reflect.get(target, key, receiver)
      return obj
    },
    set(target, key, value, receiver){
      const obj = Reflect.set(target, key, value, receiver)
      setImmediate(() => {
        save()
      })
      return obj
    }
  })
}

class Filedb {
  constructor(path, options = { raw: false }, defaults = {}) {
    this.path = path
    this.options = Object.assign({}, options)
    this.data = merge(defaults , this.all)
  }

  get all() {
    try {
      let data = fs.readFileSync(this.path, 'utf8');

      if (!this.options.raw) {
        data = base64.decode(data)
      }

      return JSON.parse(data);
    } catch (error) {
      //if it doesn't exist or permission error
      if (error.code === 'ENOENT' || error.code === 'EACCES') {
        return {};
      }

      //invalid JSON
      if (error.name === 'SyntaxError') {
        writeFileAtomic.sync(this.path, '');
        return {};
      }

      throw error;
    }

  }

  set all(value) {
    try {
      mkdir(path.dirname(this.path));

      value = JSON.stringify(value);
      if (!this.options.raw) {
        value = base64.encode(value)
      }

      writeFileAtomic.sync(this.path, value);
    } catch (error) {
      throw error;
    }
  }

  save(data) {
    /*
    if(data){
      this.data = data
    }
    */

    this.all = this.data;
  }

  get(key, chain = false) {
    if (key) {
      const data = this.data
      let ret = data[key]
      while (typeof ret == 'string' && data[ret] && chain) {
        ret = data[ret]
      }

      if (chain) {
        if (typeof ret == 'object') {
          return ret
        }
      } else {
        return ret
      }
    }
  }

  set(key, value) {
    if (arguments.length === 1) {
      for (let k of Object.keys(key)) {
        this.data[k] = key[k]
      }
    } else {
      this.data[key] = value;
    }

    setImmediate(() => {
      this.save()
    })
  }

  clear(key) {
    if (key) {
      delete this.data[key]
    } else {
      this.data = {}
    }

    this.save()
  }
}

Filedb.createDB = (...rest) => {
  return new Filedb(...rest)
}


// const cachePath = process.cwd()+'/cache/db.json';

// const db = createFiledb(cachePath);
module.exports = reactive
exports.reactive = reactive