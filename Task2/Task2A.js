const puppeteer = require('puppeteer');
const prompt = require('prompt-sync')();
const fs = require('fs-extra');


async function get_hrefs(url, dir_name){
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36');
    await page.goto(url, {waitUntil: 'load', timeout: 0});

    const result = await page.evaluate(() => {
        let data = [];
        let elements = document.querySelectorAll('a[href]');

        for (let element of elements){
            let href = element.getAttribute('href');
            data.push(href);
        }

        return data; 
    });
    await browser.close();

    return result;
}

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

function create_main_dir(url){
    let regexp = /(?<=:\/\/)[A-Za-z\.]+/;
    let match = url.match(regexp);
    let dir_name = match[0];
    if(fs.existsSync(dir_name)){
        console.log('Каталог сайта существует');
    }else{
        console.log('Каталог сайта не существует');
        fs.mkdir(dir_name, err => {
            if(err) throw err;
            console.log('Каталог сайта ' + match[0] + ' успешно создан');
         });
    }
    return dir_name;
}

function clear_clone(arr){
    let new_arr = [];
    new_arr[0] = arr[0];
    console.log(arr);
    console.log(arr.length);
    console.log('\n\n\n\n');
    for (let i = 1; i < arr.length; i++){
        for (let j = 0; j < new_arr.length; j++){
            if(arr[i] == new_arr[j]){
                break;
            }
            if(j+1 == new_arr.length){
                new_arr.push(arr[i]);
            }
        }
        
    }
    console.log('NEW ARR:');
    console.log(new_arr);
    console.log(new_arr.length);
    console.log('Удалено повторений ссылок: ' + (arr.length - new_arr.length));
    return new_arr;
}

function clear_http(arr){
    let new_arr = [];
    let regexp_http = /^(https|http):\/\//;
    for (let i = 0; i < arr.length; i++){
        if(regexp_http.test(arr[i])){
            continue;
        }else{
            new_arr.push(arr[i]);
        }
    }

    return new_arr;   
}

let url = input_url();

let dir_name = create_main_dir(url);



let type = true;
let type_name = '';
while(type){
    let ans = prompt("Сохранить ссылки как основные(0) или как вторичные(1)?: ", "0");
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

let save_path = dir_name + "/hrefs_" + type_name + ".json";
get_hrefs(url, dir_name).then((value =>{
    let arr = value;
    let new_arr = clear_clone(arr);
    new_arr = clear_http(new_arr);
    let jsonContent = JSON.stringify(new_arr);
        
    fs.writeFile(save_path, jsonContent, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
        
        console.log("Ссылки сохранены в файл " + save_path);
    });

}));