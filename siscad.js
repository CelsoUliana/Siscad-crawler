// Conforme recomendado pelo Sr.Samurai Jurio Yoshikazu mudanças na organização e funções async
// Celso Antonio -- September 2018
// Saudades Julinho

const rp        = require('request-promise')
const request   = require('request')
const fs        = require('fs')
const cheerio   = require('cheerio')
const Promise   = require('bluebird')

const urlBase               = 'https://siscad.ufms.br/'
const urlLogin              = 'https://siscad.ufms.br/titan.php'
const urlNotasFrequencia    = 'https://siscad.ufms.br/titan.php?toSection=14'
const htmlRes               = 'Notas.html'
const htmlTable             = 'Tabelas.html'

var j = request.jar()

const logarSiscad = async (login, password) => {

    try{

        // Cria o html final
        fs.writeFileSync(htmlRes, '')
        fs.writeFileSync(htmlTable, '')

        let response = await rp({
            jar: j,
            uri: urlBase,
            followAllRedirects: true,
            resolveWithFullResponse: true,
        })

        console.log('Acessou a página principal')

        response = await rp({
            jar: j,
            uri: urlLogin,
            method: 'POST',
            form: {login, password},
            followAllRedirects: true,
            resolveWithFullResponse: true,
        })

        console.log('Logou no siscad')

        response = await rp({
            jar: j,
            uri: urlNotasFrequencia,
            followAllRedirects: true,
            resolveWithFullResponse: true,
        })

        console.log('Entrou na Notas/Frequencia')

        let arr = await returnCheerio(response.body)

        let ps = await returnPromises(arr)

        Promise.all(ps).each(async pAtual => {

            console.log('Entrou na materia  ' + pAtual.name)

            response = await rp(pAtual)

            appendTableHtml(response.body, htmlTable)
            appendFullHtml(response.body, htmlRes)
        })
    }

    catch(err) {
        throw err
    }
}

async function returnPromises(objMaterias){

    var pa = []

    for(var  materia in objMaterias){

        var obj = {
            jar: j, 
            name: materia,
            encoding : 'latin1',  
            followAllRedirects: true, 
            resolveWithFullResponse : true, 
            url : urlBase + objMaterias[materia], 
        }

        pa.push(obj)
    }

    return await pa
}

async function returnCheerio(responseBody){

    var $ = cheerio.load(responseBody)
    
    var objMaterias = {}

    $('div[class="groupHeader"]').first().nextUntil('div[class="groupHeader"]').find('tr').each(function(){
        var materia = $(this).children().children().text()
        var urlMateria = $(this).children().children().attr('href')
        materia = materia.replace(/[^a-zA-Z]/g,'')

        if(materia != '')
            objMaterias[materia] = urlMateria
    })

    return await objMaterias
}

async function appendFullHtml(responseBody, html){

    fs.appendFile(html, responseBody, 'latin1', async (err) => {
        if (err) 
            throw err
        console.log('Salvou!')
    })
}

async function appendTableHtml(responseBody, html){

    var tableNotas

    var $ = cheerio.load(responseBody)

    var nomeMateria = $('span[class="infoField"]').text()
                    
    $('div[class="infoGroup"]').each(function(i) {
        if(i === 2){
            tableNotas = $(this).html()
        }
    })

    fs.appendFile(html, `<br>${nomeMateria}<br><br>${tableNotas}<br><br>` ,'latin1',  async (err) => {
        if (err) 
            throw err
        console.log('Salvou!')
    })
}

// username and password goes here
logarSiscad('SeuLogin', 'SuaSenha')