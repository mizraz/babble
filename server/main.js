var http = require('http'),
  url = require('url'),
  querystring = require('querystring');
arrUrls = ['/messages/', '/messages', '/delClient', '/delpoll', '/register', '/stats'];

var messages = require('./messages-util.js');

http.createServer(function (req, res) {


  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");

  // parse URL
  var url_parts = url.parse(req.url);
  method = req.method;


  switch (method) {
    case 'DELETE':
      {
        if (url_parts.pathname.substr(0, 10) == '/messages/') {
          if (!(isNaN(url_parts.pathname.substr(17)))) {
            var idToDel = url_parts.path.substr(10);
            idToDel = idToDel;
            var succeed = messages.deleteMessage(idToDel);
            if (succeed == 1) {
              res.end( /*JSON.stringify('succeed deleting messages')*/ );
            } else {
              res.statusCode = 404;
              res.end(JSON.stringify('fail to delete.'));
            }
          } else {
            res.statusCode = 400;
            res.end();
          }
        } else {
          if (arrUrls.includes(url_parts.pathname.substr(0))) {
            res.statusCode = 405;
            res.end();
          } else {
            res.statusCode = 404;
            res.end();
          }
        }

        break;
      }
    case 'GET':
      {
        if (url_parts.pathname.substr(0, 9) == '/messages') {
          var a = url_parts.query.substr(0, 8);
          if ((url_parts.query.substr(0, 8) == 'counter=' && !isNaN(url_parts.query.substr(9)))) {
            var counter = url_parts.query.replace(/[^0-9]*/, '');

            if (messages.messages && (Object.keys(messages.messages).length) > counter) {
              var messagesToClient = [];
              messagesToClient = messages.getMessages(counter);
              res.end(JSON.stringify(messagesToClient));

            } else {

              if (messages.messages)
                messages.clients.push(res);
              setTimeout(function () {
                res.statusCode = 204;
                res.end();

              }, 50000);
            }
          } else {
            res.statusCode = 400;
            res.end()
          }
        } else if (url_parts.pathname.substr(0, 9) == '/delPoll') {
          if (url_parts.pathname.substr(10) == "") {
            messages.clientsForDel.push(res);
            setTimeout(function () {
              res.statusCode = 204;
              res.end();

            }, 50000);
          } else {
            res.statusCode = 400;
            res.end()
          }
        } else if (url_parts.pathname.substr(0, 6) == '/stats') {
          if (url_parts.pathname.substr(7) == "") {



            messages.clientsForStats.push(res);

            setTimeout(function () {

              res.statusCode = 204;
              res.end();
            }, 50000);

          } else {
            res.statusCode = 400;
            res.end()
          }

        } else {
          if (arrUrls.includes(url_parts.pathname.substr(0))) {
            res.statusCode = 405;
            res.end();
          } else {
            res.statusCode = 404;
            res.end();
          }
        }
        break;
      }
    case 'POST':
      {
        if (url_parts.pathname.substr(0, 9) == '/messages') {
          if (url_parts.pathname.substr(10) == '') {
            // message receiving
            req.on('data', function (chunk) {
              var msgJsonForm = JSON.parse(chunk);
              var msgText = msgJsonForm.message;
              var name = msgJsonForm.name;
              var email = msgJsonForm.email;
              var timestamp = msgJsonForm.timestamp;
              var profilePicSrc = msgJsonForm.profilePicSrc;
              var msgObj = {
                id: '',
                name: name,
                email: email,
                message: msgText,
                count: 0,
                date: timestamp,
                profilePicSrc: profilePicSrc
              };
              var id = messages.addMessage(msgObj);
              res.end(JSON.stringify({
                id: id
              }));
            });

          } else {
            res.statusCode = 400;
            res.end()
          }

        } else if (url_parts.pathname.substr(0, 9) == '/register') {
          if (url_parts.pathname.substr(10) == '') {
            messages.scope.counterClients++;
            req.on('data', function (chunk) {
              var email = JSON.parse(chunk).email;
              email = email.trim();
              email = email.toLowerCase();
              var profilePicSrc = messages.register(email);

              res.end(JSON.stringify({
                profilePicSrc: profilePicSrc,
                clients: messages.scope.counterClients,
                messages: Object.keys(messages.messages).length
              }));


            });
          } else {
            res.statusCode = 400;
            res.end();
          }
        } else if (arrUrls.includes(url_parts.pathname.substr(0))) {
          res.statusCode = 405;
          res.end();
        } else {
          res.statusCode = 404;
          res.end();
        }


        break;
      }
    case 'PUT':
      {
        if (url_parts.pathname.substr(0, 10) == '/delClient') {
          if (url_parts.pathname.substr(11) == '') {
            messages.scope.counterClients--;
            res.end();
          } else {
            res.statusCode = 400;
            res.end();
          }
        } else if (arrUrls.includes(url_parts.pathname.substr(0))) {
          res.statusCode = 405;
          res.end();
        } else {
          res.statusCode = 404;
          res.end();
        }
        break;
      }
    case 'OPTIONS':
      {
        res.statusCode = 204;res.end();
        break;
      }
    default:



  }


}).listen(9000, 'localhost');