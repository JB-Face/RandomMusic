/*
 * @Descripttion: 
 * @version: 
 * @Author: JBFace
 * @Date: 2023-08-25 17:46:05
 * @LastEditors: JBFace
 * @LastEditTime: 2023-09-07 23:03:47
 */
let ipcRenderer = require('electron').ipcRenderer;
const axios = require('axios');
const { album,login_cellphone, user_cloud,register_anonimous,
  search,song_url_v1,check_music,song_detail,
  login_qr_key,login_qr_create,login_qr_check,
login_status,login_refresh} = require('NeteaseCloudMusicApi');
const nodemon = require('nodemon');

link_url = "https://music.163.com/" //网易云链接
MAX_POOL = 40;
let play_list = new Array(MAX_POOL).fill(false) //缓冲长度

let play_index = 0
let play_id = 0


async function play_music(song_id) {
  // 获取url 
  url = await song_url_v1({id:song_id,level:'standard'})
  const json = url.body;  
  player = document.getElementById('player');
  player.src = json.data[0].url;
  document.getElementById('audio').load();
  document.getElementById('audio').play();
  return json.data[0].url;
}


async function next(){
  rid = await random_music();
  await play(rid);
  await get_info(rid);
}

//
//##################### 随机创建播放列队 ##############################
//

//##################### 基础方法 #############################


async function get_info(info){
  song_name = info.name;
  singer_list =info.ar;

  link_url = "https://music.163.com/#/song?id=" + info.id  ;
  console.log(document.getElementById('link').src)

  document.getElementById('info_name').textContent = song_name ;
  r_album = info.al;
  document.getElementById('al').src = r_album.picUrl
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  // return 2172878626
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive



}

async function random_music(){
  end = false
  r_id = 0
  while (!end)
  {
    r_id = getRandomInt(10000000,3099999999)  
    res = await check_music({id : r_id})
    console.log(res.body.success)
    end = res.body.success
  }
  return r_id
}


function check_type(info) {
  if (info.name != null && info.name != "" ) {
    return true
  }
  else{return false} 
}

async function get_music_info(rid){
  res = await song_detail({ids:rid});
  return res
}


async function get_music(index) {
  //直接获取所有的 音乐信息 不去重新查找info了
  res =  null

  end = false
  r_id = 0
  while (!end)
  {
    r_id = getRandomInt(10000000,3099999999)  
    res = await check_music({id : r_id})
    end = res.body.success
  }
  res  = await song_detail({ids:r_id});

  if(res.status == 502){
    console.log("?")
  }

  if (res.body.songs[0]) {
    res = res.body.songs[0]
    // play_list[index] = res.body.songs[0]
    // res = res.body.songs[0]
    if (check_type(res)) {   
      play_list[index] = res   
      url = await song_url_v1({id:res.id,level:'standard'})
    
      if (url.body.data[0].url){
        play_list[index]["url"] = url.body.data[0].url;
      return
      }
      else{
        play_list[index] = false
      }
    }
}
  get_music(index)
}  


// 列表填充状态查询
async function get_first() {
for (let index = 0; index < 20; index++) {
  const e = play_list[index];
  if (e) {
      play_index = index; 
      console.log(e)
      return e;
    }
}

console.log('wait time out')

setTimeout(async () => {
   return  await get_first()
  },500 );

}

function not_fill(){

  res = []
  num = 0;
  play_list.forEach(e => { 
    console.log(e)
    if (!e) {
      res.push(num)
    }

    num++;

  });
  return res;

}

// 填充列表
function fill(){

  fill_list = not_fill();
  fill_list.forEach(e => {
    get_music(e);
  })

}



// 获取音乐并url 并去除信息
async function play(){
  info = await get_first();
  play_list.splice(play_index,1)
  await get_info(info);
  play_music(info.id);
  play_list.push(null);
  fill();

  console.log(document.getElementById('audio').duration)

}


//
//##################### 事件绑定 ##############################
//



document.getElementById('play').addEventListener('click', async () => {
    // await next();
    play();
  })

document.getElementById('pause').addEventListener('click', async () => {
  audio = document.getElementById('audio')
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
}
)

document.getElementById('close').addEventListener('click', async () => {
    ipcRenderer.send('window-close');
})


document.getElementById('audio').addEventListener('ended', async () => {
  await next();
})



async function getLoginStatus(cookie_str = '') {

  const res = await login_status({cookie : cookie_str})

  if (res.status == 200) {
    document.getElementById('al').src = res.body.data.profile.avatarUrl;
    document.getElementById('info_name').textContent = res.body.data.profile.nickname ;
    if (res.body.data.account.vipType > 0) {
      document.getElementById('login').textContent = "VIP";
    }
    else{
    document.getElementById('login').textContent = "💿";
    }
  }
  else{
  document.getElementById('login').textContent = "&#128279";
  }
  return res
}


document.getElementById('login').addEventListener('click', async () => {
  await login_refresh();
  console.log('login');

  // 查询登录状态
  const cookie = localStorage.getItem('cookie')
  await getLoginStatus(cookie)

  // 获取二维码 base64
  
  qr_key= await login_qr_key();
  qr_base = await login_qr_create({unikey:qr_key.body.data.unikey,qrimg:true});
  document.getElementById('al').src = qr_base.body.data.qrimg;

// 轮询当前登录状态
  let timer
  timer = setInterval(async () => {
  const statusRes = await (await login_qr_check({key:qr_key.body.data.unikey})).body;
  if (statusRes.code === 800) {
      console.log('二维码已过期,请重新获取')
      clearInterval(timer)
    }
  if (statusRes.code === 803) {
    // 这一步会返回cookie
    clearInterval(timer)
    console.log('授权登录成功')
    await getLoginStatus(statusRes.cookie)
    localStorage.setItem('cookie', statusRes.cookie)
  }
}, 3000)
})


document.getElementById("volume").addEventListener("input", (event) => {
  document.getElementById("audio").volume = (event.target.value)/10.0;
});


document.getElementById("link").addEventListener('click', (event) => {
  window.open(link_url);  
});


document.getElementById("help").addEventListener('click', () =>  {
  // window.open("help.html"); 
  out = get_first();
  console.log(play_list)
});

// document.getElementById('audio').addEventListener('playing', () => {
//     // await next();
//     document.getElementById("play").textContent = '▶I';
//   })

// 初始化
async function init(){
document.getElementById("audio").controls = false;
document.getElementById("audio").volume = 0.75;

qr_key= await login_qr_key();

const cookie = localStorage.getItem('cookie')
await getLoginStatus(cookie);
const statusRes = await (await login_qr_check({key:qr_key.body.data.unikey})).body;
fill()

}


init();



