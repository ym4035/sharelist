
module.exports = (options, app) => async (ctx , next) => {
  if(app.config.token){
    await next()
  }else{
    if( ctx.path != '/install'){
      ctx.redirect('/install')
    }
  }
}