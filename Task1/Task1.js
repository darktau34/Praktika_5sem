// При заходе на страницу скриншотить уникальные ссылки и записывать со стукртурой в файл при повторном запуске программы выводить в консоль есть ли каждая уникальная ссылка уже в скриншотах, в консоль добавить возможность ввода ссылки
// Все уникальные ссылки!!!
// сайт типо хабр

/*
const puppeteer = require('puppeteer');

async function getPic() {
  const browser = await puppeteer.launch(); // запускаем экземпляр браузера Chrome и записываем ссылку на него
  const page = await browser.newPage(); // создаем новую страницу и записываем ссылку на нее
  await page.goto('https://vk.com'); // переходим на страницу по URL
  await page.setViewport({width: 1920, height: 1080})
  await page.screenshot({path: 'VKFullHD.png'}); // делаем скриншот в параметрах путь

  await browser.close(); // закрываем браузер
}

getPic();
*/

const puppeteer = require('puppeteer');
const prompt = require('prompt-sync')();
const fs = require('fs-extra');
const { create } = require('domain');
require('events').EventEmitter.defaultMaxListeners = 15;

async function get_hrefs(url, dir_name){
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36');
    await page.goto(url, {waitUntil: 'load', timeout: 0});
    /*
    const hrefs = await page.evaluate(
        () => Array.from(
          document.querySelectorAll('a[href]'),
          a => a.getAttribute('href')
        )
      );
    */
   /*
    const hrefs = await page.evaluate(() => {
        return Array.from(document.getElementsByTagName('a'), a => a.href);
    });
    */
    //const hrefs = await page.$$eval('a', as => as.map(a => a.href));
    const result = await page.evaluate(() => {
        let data = [];
        let elements = document.querySelectorAll('a[href]');

        for (var element of elements){
            let href = element.getAttribute('href');
            data.push(href);
        }

        return data; // Возвращаем массив
    });
    await browser.close();
    //console.log(hrefs);
    //console.log('\n\n\n\n');
    return result;
}

function input_url(){
    let url = prompt("Введите url страницы:", 'http://books.toscrape.com/');
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
            if(err) throw err; // не удалось создать папку
            console.log('Каталог сайта ' + match[0] + ' успешно создан');
         });
    }
    return dir_name;
}

function create_href_dir(dir_main, href){
    //console.log('dir_main: ' + dir_main);
    //console.log('href: ' + href);
    let regexp_slesh = /\//;
    let regexp_http = /(https|http):\/\//;
    let regexp_warning_chars = /[\<\>\:\"\\\|\?\*]/gm;
    let arr = [];
    href = href.replace(regexp_http, '');
    //console.log('href1: ' + href);
    href = href.replace(regexp_warning_chars, '');
    //console.log('href2: ' + href);
    if(regexp_slesh.test(href)){
        let dirs = href.split('/');
        //console.log(dirs);
        //console.log(dirs.length);
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
    await page.screenshot({path: dir_name + file_name + '.jpeg'});

    await browser.close();
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
function write_hrefs(url, dir_name){
    get_hrefs(url, dir_name).then((value =>{
        var arr = value;
        let new_arr = clear_clone(arr);
        let jsonContent = JSON.stringify(new_arr);
        
        fs.writeFile(dir_name + "/hrefs.json", jsonContent, 'utf8', function (err) {
            if (err) {
                return console.log(err);
            }
        
            console.log("Ссылки сохранены в файл hrefs.json");
        });
    }))
}

var url = input_url();
if(url){
    var dir_name = create_main_dir(url);
    /*
    get_hrefs(url, dir_name).then((value =>{
        let hrefs_arr = value;
        let new_arr = clear_clone(hrefs_arr);
        for (let i = 0; i < new_arr.length; i++){
            let temp = create_href_dir(dir_name, new_arr[i]);
            let to_dir = temp[0];
            let file = temp[1];
            let url_goto = url + new_arr[i];
            process(url_goto, to_dir, file);
            
        }
    }))
    */

    if(fs.existsSync(dir_name + "/hrefs.json")){
        console.log('Ссылки уже были когда-то собраны, перезаписать новые?');
        let rewrite = true;
        while(rewrite){
            let str = prompt("1 - ДА, 0 - НЕТ:  ", "0");
            if(str == "1"){
                break;
            }
            if(str == "0"){
                rewrite = false;
            }
        }
        if(rewrite ){
            write_hrefs(url, dir_name);
            var hrefs_arr = fs.readJSONSync(dir_name + "/hrefs.json");
        }else{
            var hrefs_arr = fs.readJSONSync(dir_name + "/hrefs.json");
            console.log("Ссылки загружены");      
        }

    }else{
        console.log("Файла hrefs.json не существует");
        
        get_hrefs(url, dir_name).then((value =>{
            var arr = value;
            let new_arr = clear_clone(arr);
            let jsonContent = JSON.stringify(new_arr);
            
            fs.writeFile(dir_name + "/hrefs.json", jsonContent, 'utf8', function (err) {
                if (err) {
                    return console.log(err);
                }
            
                console.log("Ссылки сохранены в файл hrefs.json");
            });
            
        }))
        var hrefs_arr = fs.readJSONSync(dir_name + "/hrefs.json");
    }
    //var hrefs_arr = fs.readJSONSync(dir_name + "/hrefs.json");
    //console.log(hrefs_arr);

}

// Примерное решение первой ошибки https://stackoverflow.com/questions/8313628/node-js-request-how-to-emitter-setmaxlisteners

// Теперь необходимо сравнивать картинки, в результате получить html файл с таблицей, где url, первый скриншот, новый если отличается, тепловая карта (если отличаются но размер одинаковый)