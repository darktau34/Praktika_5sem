const prompt = require('prompt-sync')();
const fs = require('fs-extra');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');

function input_url(){
    let url = prompt("Введите url страницы:", 'https://vk.com/');
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


function load_hrefs_path(dir_name, type_name){
    let load_path = dir_name + "/hrefs_" + type_name + ".json";
    let hrefs_arr = fs.readJSONSync(load_path);
    let regexp_beginSlesh = /^\//;
    let regexp_endSlesh = /\/$/;
    let regexp_http = /(https|http):\/\//;
    let regexp_warning_chars = /[\<\>\:\"\\\|\?\*]/gm;
    for(let i = 0; i < hrefs_arr.length; i++){
        hrefs_arr[i] = hrefs_arr[i].replace(regexp_http, '');
        hrefs_arr[i] = hrefs_arr[i].replace(regexp_warning_chars, '');
        if(!regexp_beginSlesh.test(hrefs_arr[i])){
            hrefs_arr[i] = "/" + hrefs_arr[i];
        }
        if(regexp_endSlesh.test(hrefs_arr[i])){
            hrefs_arr[i] = hrefs_arr[i] + "null_name";
        }
        hrefs_arr[i] = hrefs_arr[i] + ".png";
    }
    return hrefs_arr;
}

function add_main_path(dir_name, type_name, hrefs_arr){
    for(let i = 0; i < hrefs_arr.length; i++){
        hrefs_arr[i] = dir_name + "/" + type_name + hrefs_arr[i];
    }
    return hrefs_arr;
}

function check_size(elem){
    let stat = fs.statSync(elem);
    let size = stat.size;
    return size;
}

function create_directory(dir_name){
    if(fs.existsSync(dir_name)){
        console.log('Каталог ' + dir_name + ' существует');
    }else{
        console.log('Каталог ' + dir_name + ' не существует');
        fs.mkdir(dir_name, err => {
            if(err) throw err;
            console.log('Каталог ' + dir_name + ' успешно создан');
         });
    }
}

let url = input_url();
let dir_name = false;
do{
    dir_name = find_dir(url);
} while (dir_name == false);

let basic_hrefs = load_hrefs_path(dir_name, "basic");
let secondary_hrefs = load_hrefs_path(dir_name, "secondary");

console.log("\nBASIC HREFS: " + basic_hrefs.length + "\n");
for(let i = 0; i < basic_hrefs.length; i++){
    console.log(basic_hrefs[i]);
}

console.log("\nSECONDARY HREFS: " + secondary_hrefs.length + "\n");
for(let i = 0; i < secondary_hrefs.length; i++){
    console.log(secondary_hrefs[i]);
}

let intersection = basic_hrefs.filter((item) => secondary_hrefs.includes(item));
console.log("\nINTERSECTION: " + intersection.length + "\n");
for(let i = 0; i < intersection.length; i++){
    console.log(intersection[i]);
}

let basic_intersection = intersection.slice();
let secondary_intersection = intersection.slice();

basic_intersection = add_main_path(dir_name, "basic", basic_intersection);
secondary_intersection = add_main_path(dir_name, "secondary", secondary_intersection);

let basic_intersection_size = [];
for(let i = 0; i < basic_intersection.length; i++){
    basic_intersection_size[i] = check_size(basic_intersection[i]);
}
console.log(basic_intersection_size);
console.log(basic_intersection_size.length);

let secondary_intersection_size = [];
for(let i = 0; i < secondary_intersection.length; i++){
    secondary_intersection_size[i] = check_size(secondary_intersection[i]);
}
console.log(secondary_intersection_size);
console.log(secondary_intersection_size.length);

let intersection_length = basic_intersection.length;
let bas_equals = [];
let sec_equals = [];
let bas_diff = [];
let sec_diff = [];
for(let i = 0; i < intersection_length; i++){
    let bas = basic_intersection_size[i];
    let sec = secondary_intersection_size[i];
    let bas_name = basic_intersection[i];
    let sec_name = secondary_intersection[i];
    if(bas == sec){
        console.log(bas + " = " + sec);
        console.log(bas_name + " = " + sec_name);
        bas_equals.push(bas_name);
        sec_equals.push(sec_name);
    }else if((bas > sec) || (bas < sec)){
        console.log(bas + " <> " + sec);
        console.log(bas_name + " <> " + sec_name);
        bas_diff.push(bas_name);
        sec_diff.push(sec_name);
    }
}

save_path = dir_name + "/" + "bas_equals.json";
jsonContent = JSON.stringify(bas_equals);
fs.writeFile(save_path, jsonContent, 'utf8', function (err) {
    if (err) {
        return console.log(err);
    }
    
    console.log("Пути к файлам сохранены в файл " + save_path);
});

save_path = dir_name + "/" + "sec_equals.json";
jsonContent = JSON.stringify(sec_equals);
fs.writeFile(save_path, jsonContent, 'utf8', function (err) {
    if (err) {
        return console.log(err);
    }
    
    console.log("Пути к файлам сохранены в файл " + save_path);
});

save_path = dir_name + "/" + "bas_difference.json";
jsonContent = JSON.stringify(bas_diff);
fs.writeFile(save_path, jsonContent, 'utf8', function (err) {
    if (err) {
        return console.log(err);
    }
    
    console.log("Пути к файлам сохранены в файл " + save_path);
});

save_path = dir_name + "/" + "sec_difference.json";
jsonContent = JSON.stringify(sec_diff);
fs.writeFile(save_path, jsonContent, 'utf8', function (err) {
    if (err) {
        return console.log(err);
    }
    
    console.log("Пути к файлам сохранены в файл " + save_path);
});

let dir_diff = dir_name + "/diff";
create_directory(dir_diff);
let dir_diff_equals = dir_diff + "/equals";
create_directory(dir_diff_equals);
let dir_diff_difference = dir_diff + "/difference";
create_directory(dir_diff_difference);

let equals_heat = [];
let diff_heat = [];
for(let i = 0; i < bas_equals.length; i++){
    let img1 = PNG.sync.read(fs.readFileSync(bas_equals[i]));
    let img2 = PNG.sync.read(fs.readFileSync(sec_equals[i]));

    let {width, height} = img1;
    let diff = new PNG({width, height});
    pixelmatch(img1.data, img2.data, diff.data, width, height, {threshold: 0.1});
    equals_heat[i] = 'vk.com/diff/equals/diff' + i + '.png';
    fs.writeFileSync('vk.com/diff/equals/diff' + i + '.png', PNG.sync.write(diff));
}

for(let i = 0; i < bas_diff.length; i++){
    let img1 = PNG.sync.read(fs.readFileSync(bas_diff[i]));
    let img2 = PNG.sync.read(fs.readFileSync(sec_diff[i]));

    let {width, height} = img1;
    let diff = new PNG({width, height});
    pixelmatch(img1.data, img2.data, diff.data, width, height, {threshold: 0.1});
    diff_heat[i] = 'vk.com/diff/difference/diff' + i + '.png';
    fs.writeFileSync('vk.com/diff/difference/diff' + i + '.png', PNG.sync.write(diff));
}

console.log(bas_equals.length);
console.log(bas_equals);

console.log(sec_equals.length);
console.log(sec_equals);

console.log(equals_heat.length);
console.log(equals_heat);
console.log(diff_heat.length);
console.log(diff_heat);
let path_html = dir_name + "_index.html";

const createRow = (item) => `
 <tr>
 <td><a href="${item[0]}">${item[0]}</a></td>
 <td><img src="${item[1]}" style="max-width:300px;"></td>
 <td><img src="${item[2]}" style="max-width:300px;"></td>
 <td><img src="${item[3]}" style="max-width:300px;"></td>
 </tr>
`;

const createTable = (rows) => `
 <table>
 <tr>
 <th>URL</td>
 <th>Первый скриншот</td>
 <th>Второй скриншот</td>
 <th>Тепловая карта</td>
 </tr>
 ${rows}
 </table>
`;

const createHtml = (table1, table2) => `
 <html>
 <head>
 <style>
 table {
 width: 100%;
        }
 tr {
 text-align: left;
 border: 1px solid black;
        }
 th, td {
 padding: 15px;
        }
 tr:nth-child(odd) {
 background: #CCC
        }
 tr:nth-child(even) {
 background: #FFF
        }
 .no-content {
 background-color: red;
        }
 </style>
 </head>
 <body>
 <h2 style="text-align: center;">Одинаковая размерность</h2>
 ${table1}
 <h2 style="text-align: center;">Различная размерность</h2>
 ${table2}
 </body>
 </html>
`;

function toURL(str, url, dir_name){
    let regexp_png = /.png/;
    let regexp_moreSlesh = /\/{2,}/;
    str = str.replace(regexp_png, '');
    str = str.replace("basic", '');
    str = str.replace("null_name", '');
    str = str.replace(regexp_moreSlesh, '/');
    str = str.replace(dir_name + "/", '');
    str = url + str;
    return str;
}

let row_arr = [];
let rows = '';
for(let i = 0; i < bas_equals.length; i++){
    row_arr[0] = toURL(bas_equals[i], url, dir_name);
    row_arr[1] = bas_equals[i];
    row_arr[2] = sec_equals[i];
    row_arr[3] = equals_heat[i];
    rows += createRow(row_arr);
}


const table1 = createTable(rows);
rows = '';
for(let i = 0; i < bas_diff.length; i++){
    row_arr[0] = toURL(bas_diff[i], url, dir_name);
    row_arr[1] = bas_diff[i];
    row_arr[2] = sec_diff[i];
    row_arr[3] = diff_heat[i];
    rows += createRow(row_arr);
}
const table2 = createTable(rows);
const html = createHtml(table1, table2);

fs.writeFileSync(path_html, html);

