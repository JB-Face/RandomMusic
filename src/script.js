/*
 * @Descripttion: 
 * @version: 
 * @Author: JBFace
 * @Date: 2023-08-25 17:46:05
 * @LastEditors: JBFace
 * @LastEditTime: 2023-08-31 17:54:05
 */

const { album,login_cellphone, user_cloud,register_anonimous,search,song_url_v1,check_music,song_detail} = require('NeteaseCloudMusicApi')
/*

登录相关

*/
document.getElementById("audio").controls = false;

document.getElementById("audio").volume = 0.75;



async function nologin(){

  try {
    const result = await register_anonimous()
    console.log(result)
  
  } catch (error) {
    console.log('??????')
  }

}
/*
播放
*/

async function play(song_id) {
  // 获取url
  url = await song_url_v1({id:song_id,level:'standard'})
  const json = JSON.parse(new TextDecoder().decode(url.body))
  console.log(json.data[0])
  


  player = document.getElementById('player');
  player.src = json.data[0].url;
  document.getElementById('audio').load();
  document.getElementById('audio').play();

  return json.data[0].url;
}


/*
搜索获取
*/

async function searchit(){
  try {
    key = "eva";
    const result = await search({keywords : key})
    console.log(result)  
    return result;

  } catch (error) {
    return null;
  }
}

async function get_info(rid){
  res = await song_detail({ids:rid});
  song_name = res.body.songs[0].name;
  singer_list = res.body.songs[0].ar;
  console.log(res)
  info = song_name;
  document.getElementById('info').textContent = info;
  
  console.log(singer_list);
  document.getElementById('singer').textContent = singer_list[0].name ;
  r_album = res.body.songs[0].al;
  document.getElementById('al').src = r_album.picUrl
}


/*
随机
*/

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

async function random_music(){
  // r_id = getRandomInt(100000000,2099999999)
  // console.log(r_id);

  // res = await check_music({id : r_id})
  // console.log(res.body.success)
  end = false
  r_id = 0
  while (!end)
  {
    r_id = getRandomInt(10000000,3099999999)

  
    res = await check_music({id : r_id})
    console.log(res.body.success)
    end = res.body.success
  }
  console.log(r_id);
  return r_id
}



async function test(pass) {

  getlist = await searchit();
  song_id =  getlist.body.result.songs[0].id;
  console.log(getlist.body.result.songs)
  url = await play(song_id);
  player = document.getElementById('player');
  player.src = url;
  document.getElementById('audio').load();
  document.getElementById('audio').play();
}


async function next(){

  rid = await random_music();
  await play(rid);
  await get_info(rid);
}


async function volumechange(number){
  audio = document.getElementById('audio')

  target = audio.volume+number

    if (target >= 1.0) {
      audio.volume = 1.0;
      return;
    }

    if (target<=0.1) {
      audio.volume = 0.0;
      return;
    }

    audio.volume = target;


  } 




document.getElementById('play').addEventListener('click', async () => {
    await next();
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


document.getElementById('add').addEventListener('click', async () => {
  await volumechange(0.1);
})


document.getElementById('sub').addEventListener('click', async () => {
  await volumechange(-0.1);
})



document.getElementById('audio').addEventListener('ended', async () => {
  await next();
})






