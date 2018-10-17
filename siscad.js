// Conforme recomendado pelo Sr.Samurai Jurio Yoshikazu mudanças na organização e funções async
// Celso Antonio -- September 2018
// Saudades Julinho

const rp        = require('request-promise')
const request   = require('request')
const fs        = require('fs')
const cheerio   = require('cheerio')

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

        const arr = await getUrlMaterias(response.body)

        await arr.forEach(async (materia) => {

            console.log(`Entrou na materia ${materia.nome}`)

            const options = {
                jar: j,
                encoding: 'latin1',
                followAllRedirects: true,
                resolveWithFullResponse: true,
                url: `${urlBase}${materia.url}`,
            }

            response = await rp(options)

            appendTableHtml(response.body, htmlTable)
            appendFullHtml(response.body, htmlRes)
        })
    } 

    catch(err) {
        throw err
    }
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

async function getUrlMaterias(responseBody) {

    const $ = cheerio.load(responseBody)
    let urlMateria
    const arr = []
  
    $('div[class="groupHeader"]').first().nextUntil('div[class="groupHeader"]').find('tr')
        .each((i, elem) => {
            const objMaterias = {}
            let materia = $(elem).children().children().text()
            materia = materia.replace(/[^a-zA-Z ]+/g, '')
            urlMateria = $(elem).children().children().attr('href')
  
            if (materia) {
                objMaterias.nome = materia
                objMaterias.url = urlMateria
                arr.push(objMaterias)
            }
        })
  
    return await arr
}

//username and password goes here
const args = process.argv.slice(2)

if (args.length < 2) {
  	console.log("please provide RGA and password / Por favor informe RGA e senha")
  	process.exit(1)
}

const login 	= args[0]
const password 	= args[1]

logarSiscad(login, password)



