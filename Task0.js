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

// https://habr.com/ru/company/ruvds/blog/341348/
// node --version
// node имя_файла.js

// При заходе на страницу скриншотить уникальные ссылки и записывать со стукртурой в файл при повторном запуске программы выводить в консоль есть ли каждая уникальная ссылка уже в скриншотах, в консоль добавить возможность ввода ссылки
// Все уникальные ссылки!!!
// сайт типо хабр