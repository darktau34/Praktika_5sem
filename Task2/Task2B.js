const puppeteer = require('puppeteer');
const prompt = require('prompt-sync')();
const fs = require('fs-extra');


function input_url(){
    let url = prompt("Введите url страницы:", 'https://habr.com/');
    let regexp = /^(https|http):\/\/[^ "]+$/;
    let end_regexp = /\/$/;

    if(regexp.test(url)){
        console.log('url введен ВЕРНО');
        if(!end_regexp.test(url)){
            url = url + '/';
        }
        return url;
    }else{
        console.log('Вы неправильно ввели URL!');
        return false;
    }
}
function find_dir(url){
    let regexp = /(?<=:\/\/)[A-Za-z\.]+/;
    let match = url.match(regexp);
    let dir_name = match[0];
    if(fs.existsSync(dir_name)){
        console.log('Каталог сайта существует');
    }else{
        console.log('Каталог сайта не существует');
        dir_name = false;
    }
    return dir_name;
}

function create_href_dir(dir_main, href){
    let regexp_slesh = /\//;
    let regexp_http = /(https|http):\/\//;
    let regexp_warning_chars = /[\<\>\:\"\\\|\?\*]/gm;
    let arr = [];
    href = href.replace(regexp_http, '');
    href = href.replace(regexp_warning_chars, '');
    if(regexp_slesh.test(href)){
        let dirs = href.split('/');
        let dir_name = dir_main;
        while(dirs.length > 1){
            let first = dirs.shift();
            dir_name = dir_name + '/' + first;
            if(fs.existsSync(dir_name)){
                //console.log('Папка ' + dir_name + ' существует');
            }else{
                //console.log('Папки ' + dir_name +  ' не существует');
                fs.mkdir(dir_name, err => {
                    if(err) throw err; // не удалось создать папку
                    //console.log('Папка ' + dir_name + ' успешно создана');
                 });
            }
        }
        let dir = dir_name + '/';
        let file = dirs.pop();  
        arr[0] = dir;
        arr[1] = file;
    }else{
        arr[0] = dir_main + '/';
        arr[1] = href;
    }

    return arr;
}

async function process(url, dir_name, file_name){
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36');
    await page.goto(url, {waitUntil: 'load', timeout: 0});
    await page.setViewport({width: 1920, height: 1080})
    await page.screenshot({path: dir_name + file_name + '.png'});

    await browser.close();
}

function check_href(href){
    let regexp_slesh = /^\//;
    if(regexp_slesh.test(href)){
        href = href.replace(regexp_slesh, '');
    }
    return href;
}

let url = input_url();
let dir_name = false;
do{
    dir_name = find_dir(url);
} while (dir_name == false);

let type = true;
let type_name = '';
while(type){
    let ans = prompt("Сделать скриншоты каких ссылок основных(0) или вторичных(1)?: ", "0");
    if(ans == "0"){
        break;
    }
    if(ans == "1"){
        type = false;
    }
}
if(type){
    type_name = "basic"; 
}else{
    type_name = "secondary";     
}

let load_path = dir_name + "/hrefs_" + type_name + ".json";
dir_name = dir_name + "/" + type_name;
if(fs.existsSync(dir_name)){
    console.log('Каталог ' + dir_name + ' существует');
}else{
    console.log('Каталог ' + dir_name + ' не существует');
    fs.mkdir(dir_name, err => {
        if(err) throw err;
        console.log('Каталог ' + dir_name + ' успешно создан');
     });
}

let hrefs_arr = fs.readJSONSync(load_path);
console.log(hrefs_arr);
let regexp_http = /^(https|http):\/\//;
let end = hrefs_arr.length;
if(hrefs_arr.length > 50 ){
    end = 50;
}
for (let i = 0; i < end; i++){
    hrefs_arr[i] = check_href(hrefs_arr[i]);
    let temp = create_href_dir(dir_name, hrefs_arr[i]);
    let to_dir = temp[0];
    let file = temp[1];
    if(file == ''){
        file = "null_name";
    }
    let url_goto = '';
    if(regexp_http.test(hrefs_arr[i])){
        url_goto = hrefs_arr[i];
    }else{
        url_goto = url + hrefs_arr[i];
    }
    
    process(url_goto, to_dir, file); 
}