module.exports = app => {
  console.log(app)
  
  const { router, controller, middleware } = app;
  const installMid = middleware.install({},app);
  //router.get('/', controller.home.index);

  router.get('/manage', installMid, controller.manage.home)
  .post('/manage', installMid, controller.manage.home)
  .post('/manage/api' ,installMid,  controller.manage.api)
  .post('/manage/api/:token', installMid, controller.manage.api_token)
  .get('/manage/api/:token', installMid, controller.manage.api_token)
  .get('/manage/shell', installMid, controller.manage.shell)
  .post('/manage/shell', installMid, controller.manage.shell_exec)
  .get('/admin',(ctx) => {
    ctx.redirect('/manage')
  })



  // .get('/install', controller.install.home)
  // .post('/install', controller.install.save)


  .all('/:path(.*)',installMid, async (ctx, next) => {
    if (ctx.webdav) {
      await webdav(ctx, next)
    } else {
      await sharelist.index(ctx, next)
    }
  })

}

/*
const router = require('koa-router')()
const sharelist = require('./controllers/sharelist')
const manage = require('./controllers/manage')
const install = require('./controllers/install')
const webdav = require('./controllers/webdav')
const installMid = require('./middleware/koa-install')

router.get('/manage', installMid, manage.home)
  .post('/manage', installMid, manage.home)
  .post('/manage/api' ,installMid,  manage.api)
  .post('/manage/api/:token', installMid, manage.api_token)
  .get('/manage/api/:token', installMid, manage.api_token)
  .get('/manage/shell', installMid, manage.shell)
  .post('/manage/shell', installMid, manage.shell_exec)
  .get('/admin',(ctx) => {
    ctx.redirect('/manage')
  })



  .get('/install', install.home)
  .post('/install', install.save)


  .all('/:path(.*)',installMid, async (ctx, next) => {
    if (ctx.webdav) {
      await webdav(ctx, next)
    } else {
      await sharelist.index(ctx, next)
    }
  })

module.exports = router
*/