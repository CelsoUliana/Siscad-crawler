const rp        = require('request-promise')
const request   = require('request')
const fs        = require('fs')
const cheerio   = require('cheerio')
const Promise   = require('bluebird')


var urlBase = 'https://siscad.ufms.br/'
var urlMateria;
var j = request.jar()

// Cria o html final
fs.writeFileSync('resultado.html', '');

var objMaterias = {};

    rp({uri: urlBase, jar: j, resolveWithFullResponse: true, followAllRedirects: true})
    .then(response => {

        console.log('Acessou pagina principal')

        var urlLogin = 'https://siscad.ufms.br/titan.php'

    return rp({method: 'POST', uri: urlLogin, jar: j, resolveWithFullResponse: true, followAllRedirects: true, form:  {'login': 'seulogin', 'password': "suasenha"}})
    })
    .then(response => {

        console.log('Logou no siscad')

        var urlNotasFrequencia = 'https://siscad.ufms.br/titan.php?toSection=14'

    return rp({method: 'GET', uri: urlNotasFrequencia, jar: j, resolveWithFullResponse: true, followAllRedirects: true})
    })
    .then(response => {

        console.log('Entrou na Notas/Frequencia')

        var $ = cheerio.load(response.body);

        $('div[class="groupHeader"]').first().nextUntil('div[class="groupHeader"]').find('tr').each(function(i, elem){
            var materiaItem = {}
            materia = $(this).children().children().text()
            urlMateria = $(this).children().children().attr('href')
            materia = materia.replace(/[^a-zA-Z]/g,'')
            if(materia != '')
                objMaterias[materia] = urlMateria;
            console.log(materia)
            console.log(urlMateria)
            
            console.log('___')
        })

        var urlMateria = 'https://siscad.ufms.br/titan.php?toSection=14&toAction=view&page=1&pesq0=0&pesq1=&pesq2=&itemId=6247907'

        var pa = [];

        for(var materia in objMaterias){
            var obj = {name: materia, method: 'GET', url : urlBase + objMaterias[materia], jar: j, resolveWithFullResponse : true, followAllRedirects: true, encoding : 'latin1'};
            pa.push(obj);
        }

        Promise.all(pa).each(pAtual => {
            console.log('Entrou na materia  ' + pAtual.name);

            return rp(pAtual)
            .then(response => {
                    
                var tableNotas;

                var $ = cheerio.load(response.body);

                var nomeMateria = $('span[class="infoField"]').text();
                    
                $('div[class="infoGroup"]').each(function(i, elem) {
                    if(i === 2){
                        tableNotas = $(this).html()
                    }
                })

                var nomeMateriaResumido = nomeMateria.substring(24,35);

                fs.appendFile('resultado.html', `<br>${nomeMateria}<br><br>${tableNotas}<br><br>` , function (err) {
                    if (err) 
                        throw err;
                    console.log('Salvou!');
                });
            })
        })
 });