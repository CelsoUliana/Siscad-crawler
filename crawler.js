const rp = require('request-promise'),
   request = require('request'),
   fs = require('fs'), 
    cheerio = require('cheerio');


var urlBase = 'https://siscad.ufms.br/'
var urlMateria;
var j = request.jar()

var headers = {
    // setar os headers
}

var objMaterias = {};

 rp({uri: urlBase, jar: j, resolveWithFullResponse: true, followAllRedirects: true})
     .then(response => {
      // Pagina principal
      console.log('Acessou pagina principal')
       fs.writeFileSync('paginaPrincipal.html', response.body)

      var urlLogin = 'https://siscad.ufms.br/titan.php'
      return rp({method: 'POST', uri: urlLogin, jar: j, resolveWithFullResponse: true, followAllRedirects: true, form:  {'login': 'seulogin', 'password': "suasenha"}})
     })
     .then(response => {
     //Logou no siscad
     console.log('Logou no siscad')
       fs.writeFileSync('paginaLogada.html', response.body)

     var urlNotasFrequencia = 'https://siscad.ufms.br/titan.php?toSection=14'
     return rp({method: 'GET', uri: urlNotasFrequencia, jar: j, resolveWithFullResponse: true, followAllRedirects: true})
    })
     .then(response => {
      //Entrou na Notas/Frequencia
    var fh = fs.readFileSync('paginaNotasFrequencia.html','latin1');
        console.log('Entrou na Notas/Frequencia')
      //fs.writeFileSync('paginaNotasFrequencia.html', response.body)
        var $ = cheerio.load(fh);
        // var $ = cheerio.load(response.body)
        // $('table[id="list"]').find('tr').first().each(function(i,elem){
        //     console.log($(this))
        // })

        // console.log($('table[id="list"]').attr('href'))
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
        console.log(objMaterias)
        // var urlMateria = urlBase + 


    //     var urlMateria = 'https://siscad.ufms.br/titan.php?toSection=14&toAction=view&page=1&pesq0=0&pesq1=&pesq2=&itemId=6247907'
       // return rp({method: 'GET', uri: objMaterias., jar: j, resolveWithFullResponse: true, followAllRedirects: true, encoding: 'latin1'})
    // })
    // .then(response => {
    //     //Entrou na materia escolhida
    //     console.log('Entrou na materia escolhida')
    //     // fs.writeFileSync('paginaMateria.html', response.body, 'latin1')

    //     var $ = cheerio.load(response.body)

    //     var nomeMateria = $('span[class="infoField"]').text()
    //     console.log(nomeMateria);

    //     var tableNotas;
    //     $('div[class="infoGroup"]').each(function(i, elem) {
    //         // console.log($(this))
    //         if(i===2){
    //             tableNotas = $(this).html()
    //         }
    //     })

    //     console.log(tableNotas);

    //     fs.writeFileSync('tabelaNotas.html', `${nomeMateria}<br><br>${tableNotas}`, 'latin1')
    //     return;
    // })
    // .catch(err => {
    //  console.log(err);
 });