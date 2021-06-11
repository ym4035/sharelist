const DB = require('./db');

const defaultConfig = {
  port:process.env.PORT || 33001 , 

  proxy_enable : 0 ,

  preview_enable : 1,

  index_enable:1,

  webdav_path : '/webdav/',
  //目录刷新时间 15分钟getDrive
  max_age_dir: 15 * 60 * 1000,
  //外链 10分钟
  max_age_file: 5 * 60 * 1000,

  max_age_download:0,

  skin:'default',

  //忽略文件（扩展名）
  ignore_file_extensions:'',

  ignore_files:'.passwd',

  readme_enable:1,

  ignore_paths:{
    '__root__':['/readme.md']
  },

  max_age_download_sign:'sl_'+Date.now(),

  anonymous_uplod_enable:0,

  anonymous_download:'',

  plugin_option:[],

  custom_style:'',

  custom_script:'',

  //代理路径
  proxy_paths:[],

  proxy_server:'',

  ocr_server:'https://api.reruin.net/ocr',

  smb_server_enable: false,
  
  smb_server_port:8445,

  smb_anonymous_enable:true,

  theme:'default',
}


module.exports = (app , options) => {
  return DB(options.path , {raw:true} , {
    ...defaultConfig,
    port:options.port
  });
}
