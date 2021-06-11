const { loadBase , loadFile } = require('./loader')
const Koa = require('koa')
const path = require('path')
const os = require('os')
const Router = require('koa-router')
const cors = require('@koa/cors')
const utils = require('./utils')

const loadPlugin = (app , plugins) => {
  let { defaultConfig } = app
  for(let name in plugins){
    let plugin = plugins[name] , filepath = plugin.package || plugin.path
    if( filepath ){
      let mod = loadFile(filepath)
      let args = [app]
      if( defaultConfig[name] ) args.push(defaultConfig[name])
      mod(...args) 
    }
  }
}

class App extends Koa{
  constructor(){
    super()

    this.appInfo = {
      baseDir:path.join(__dirname,'../')
    }

    this.defaultConfig = {
      middleware: ['session','cors','koaBody','json','paths','logger'],
      locales:{
        dir:path.resolve(this.appInfo.baseDir,'../locales'),
        defaultLocale:'zh-CN'
      },
      session:{
        key: 'USER_SID'
      },
      theme:{
        dir : path.resolve(this.appInfo.baseDir,'../theme')
      },
      cache:{
        path: path.resolve(this.appInfo.baseDir,'../cache/db.json')
      }
    }

    this.coreMiddleware = {
      session:{
        package:'koa-session-minimal'
      },
      cors:{
        package:'@koa/cors'
      },
      koaBody:{
        package:'koa-body'
      },
      json:{
        package:'koa-json'
      },
      logger:{
        package:'koa-logger'
      },
    }

    this.defaultPlugins = {
      locales:{
        package:'koa-locales',
      },
      onerror:{
        package:'koa-onerror',
      },
      theme:{
        path:path.join(this.appInfo.baseDir,'core','theme.js'),
      },
      cache:{
        path:path.join(this.appInfo.baseDir,'core','cache.js'),
      }
    }

    this.init()
  }

  async init(){
    this.loadConfig()

    await this.loadMiddleware()

    await this.loadController()

    await this.loadService()

    await this.loadRouter()

    this.mixServer()
  }

  async loadConfig(){
    this.config = loadFile(path.join(this.appInfo.baseDir,'core','config.js'))(this,{
      port:process.env.PORT || 33001,
      path:path.resolve(this.appInfo.baseDir,'../','cache/config.json')
    })
  }

  async loadMiddleware(){
    let appMiddleware = await loadBase(this,'middleware')
    let coreMiddleware = utils.each(this.coreMiddleware, (i) => loadFile(i.package))
    let middlewares = { ...appMiddleware, ...coreMiddleware }

    let enabled = this.defaultConfig.middleware

    for(let i of enabled){
      if( middlewares[i] ){
        let options = this.defaultConfig[i]
        this.use(middlewares[i](options))
        delete middlewares[i]
      }
    }

    for(let i in middlewares){
      this.middleware[i] = middlewares[i]
    }

  }

  async loadController(){
    this.controller = await loadBase(this,'controller',true)
  }

  async loadService(){
    this.service = await loadBase(this,'service')
  }

  async loadRouter(){
    this.router = Router()
    loadFile(path.join(this.appInfo.baseDir,'core','router.js'))(this)
  }

  mixServer(){
    let {middleware , router , defaultPlugins} = this

    loadPlugin(this , defaultPlugins)

    this.use(router.routes()).use(router.allowedMethods())

  }
}

class Context {
  constructor(){

  }
}


exports.App = App
exports.Context = Context
