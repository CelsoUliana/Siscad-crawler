const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const rp = require('request-promise');

const urlBase = 'https://siscad.ufms.br/';
const urlLogin = 'https://siscad.ufms.br/titan.php';
const urlNotasFrequencia = 'https://siscad.ufms.br/titan.php?toSection=14';

const htmlRes = 'Notas.html';
const htmlTable = 'Tabelas.html';

let urlMateria;
const j = request.jar();

function getUrlMaterias(responseBody) {
  const $ = cheerio.load(responseBody);

  const arr = [];

  $('div[class="groupHeader"]').first().nextUntil('div[class="groupHeader"]').find('tr')
    .each((i, elem) => {
      const objMaterias = {};
      let materia = $(elem).children().children().text();
      materia = materia.replace(/[^a-zA-Z ]+/g, '');
      urlMateria = $(elem).children().children().attr('href');

      if (materia) {
        objMaterias.nome = materia;
        objMaterias.url = urlMateria;
        arr.push(objMaterias);
      }
    });

  return arr;
}

function appendFullHtml(responseBody, file) {
  fs.appendFileSync(file, responseBody, 'latin1');
  console.log('Salvou!');
}

function appendTableHtml(responseBody, file) {
  let tableNotas;

  const $ = cheerio.load(responseBody);
  const nomeMateria = $('span[class="infoField"]').text();

  $('div[class="infoGroup"]').each((i, elem) => {
    if (i === 2) {
      tableNotas = $(elem).html();
    }
  });

  fs.appendFileSync(file, `<br>${nomeMateria}<br><br>${tableNotas}<br><br>`, 'latin1');
  console.log(`Salvou ${nomeMateria}`);
}

const show = async (login, password) => {
  try {
    let response = await rp({
      jar: j,
      uri: urlBase,
      followAllRedirects: true,
      resolveWithFullResponse: true,
    });
    console.log('Acessou a página principal');

    response = await rp({
      jar: j,
      uri: urlLogin,
      method: 'POST',
      form: { login, password },
      followAllRedirects: true,
      resolveWithFullResponse: true,
    });
    console.log('Logou no siscad');

    response = await rp({
      jar: j,
      encoding: 'latin1',
      uri: urlNotasFrequencia,
      followAllRedirects: true,
      resolveWithFullResponse: true,
    });
    console.log('Entrou na Notas/Frequencia');

    const arr = getUrlMaterias(response.body);

    await arr.forEach(async (materia) => {
      console.log(`Entrou na materia ${materia.nome}`);
      const options = {
        jar: j,
        encoding: 'latin1',
        followAllRedirects: true,
        resolveWithFullResponse: true,
        url: `${urlBase}${materia.url}`,
      };
      response = await rp(options);
      appendTableHtml(response.body, htmlTable);
      appendFullHtml(response.body, htmlRes);
    });
  } catch (err) {
    throw err;
  }
};

// username and password goes here
show('SeuLogin', 'SuaSenha');
