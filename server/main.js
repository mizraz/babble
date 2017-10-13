var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    querystring = require('querystring');
    arrUrls = ['/messages/', '/messages', '/delClient', '/delpoll', '/register', '/stats'];

var messages = require('./messages-util.js');

//console.log("md5: " + md5.md5('mizraz@gmail.com'));
http.createServer(function (req, res) {
  
  
  //console.log("createServer invoked");
  res.setHeader("Access-Control-Allow-Headers", "*"); 
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
 
   // parse URL
   var url_parts = url.parse(req.url);
   method = req.method; 
   //console.log(req.method);
   //console.log('path name ' + url_parts.pathname.substr(0,6)); 

switch (method) {
  case 'DELETE':
  {
    console.log('in DELETE: '+ url_parts.pathname.substr(0,10))
    if (url_parts.pathname.substr(0,10) == '/messages/' ) {
      console.log(url_parts.pathname.substr(17));
      console.log(isNaN(url_parts.pathname.substr(17)));
      if (!(isNaN(url_parts.pathname.substr(17)))) {
        console.log('in DELETE: ');
        var idToDel = url_parts.path.substr(10);
        idToDel = idToDel;
        console.log('in DELETE: with id: '+ idToDel);
        
        var sucssed = messages.deleteMessage(idToDel);
        if (sucssed == 1) {
          console.log(sucssed);
          res.end(/*JSON.stringify('sucssed')*/);
        }         
        else {
          console.log("in server delMessage id not found");
          res.statusCode = 404; res.end(JSON.stringify('fail to delete.'));
        }
      }
      else {res.statusCode = 400; res.end();}
    }
    else {
      if (arrUrls.includes(url_parts.pathname.substr(0))){res.statusCode = 405;res.end();}
      else {res.statusCode = 404; res.end();}
    }

    break;
  }
  case 'GET':
  {
    if (url_parts.pathname.substr(0,9) == '/messages' ) {
      // console.log(isNaN(url_parts.pathname.substr(19)));
      var a = url_parts.query.substr(0,8);
      console.log(a);
      // console.log(url_parts.query.replace(/[^0-9]*/, ''));
      if ((url_parts.query.substr(0,8) == 'counter=' && !isNaN(url_parts.query.substr(9)))) {
        var counter = url_parts.query.replace(/[^0-9]*/, '');
        console.log(url_parts.query.replace(/[^0-9]*/, ''));
        console.log('count from user: ' + counter);
        if(messages.messages && (Object.keys(messages.messages).length) > counter) {
          //console.log('in cond: ');       
          var messagesToClient = [];
          messagesToClient = messages.getMessages(counter);   
          //console.log("res: " + JSON.stringify(messagesToClient));    
          res.end(JSON.stringify(messagesToClient));

          } else {
          //console.log('in else: ');       
          //console.log(messages.messages);
          if (messages.messages)
            //console.log(Object.keys(messages.messages).length);
          messages.clients.push(res);
          setTimeout(function(){ 
          res.statusCode = 204;
          res.end();
          
          console.log('in GetMessages setTimeout ended'); }, 50000);
        }
      }
      else  {res.statusCode = 400; res.end()}
    } else if (url_parts.pathname.substr(0,9) == '/delPoll') {
        if (url_parts.pathname.substr(10) == "") {
                  //console.log("in delPoll");
        // while (!messages.clientsForDel);

        messages.clientsForDel.push(res);
        setTimeout(function(){ 
          res.statusCode = 204;
          res.end();
          
          console.log('in delpoll setTimeout ended'); }, 50000);
        }
        else  {res.statusCode = 400; res.end()}
      }
      else if (url_parts.pathname.substr(0,6) == '/stats') {
        if (url_parts.pathname.substr(7) == "") {
        // //console.log('recived stats GET');
          
        console.log("START STATS messages.clientsForStats.length = "+ messages.clientsForStats.length);
        console.log('messages.counterClients: ' + messages.scope.counterClients);
        messages.clientsForStats.push(res);
        console.log("END STATS messages.clientsForStats.length = " + messages.clientsForStats.length);
        
        setTimeout(function(){ 
          // messages.scope.counterClients--;            
          
          res.statusCode = 204;
          res.end();                     
          console.log('in stats setTimeout ended'); }, 50000);
       
        } else {res.statusCode = 400; res.end()}   

      }else {
          if (arrUrls.includes(url_parts.pathname.substr(0))){res.statusCode = 405; res.end();}
          else {res.statusCode = 404; res.end();}
      }
      break;
  }
  case 'POST':
  {
    console.log(arrUrls);
    if(url_parts.pathname.substr(0, 9) == '/messages') {
      if (url_parts.pathname.substr(10) == '') {
        // message receiving
        req.on('data', function(chunk){
          //console.log("START POST");
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
            profilePicSrc: profilePicSrc};
          var id = messages.addMessage(msgObj);
          res.end(JSON.stringify({id: id}));
        });
    
      } else {res.statusCode = 400; res.end()}   

    }
    else if(url_parts.pathname.substr(0, 9) == '/register') {
      if (url_parts.pathname.substr(10) == '') {
        console.log("in register");
        messages.scope.counterClients++;            
        req.on('data', function(chunk){
          var email = JSON.parse(chunk).email;
          email = email.trim();
          email = email.toLowerCase();
          var profilePicSrc = messages.register(email);
          //console.log('in if register: profileSrc: ' + profilePicSrc);
          
          res.end(JSON.stringify({profilePicSrc: profilePicSrc,
                clients: messages.scope.counterClients,
                messages: Object.keys(messages.messages).length }));


        });
      } else {res.statusCode = 400;res.end();}
  }
  else if (arrUrls.includes(url_parts.pathname.substr(0))){res.statusCode=405;res.end();}
  else {res.statusCode = 404;res.end();}


    break;
  }
  case 'PUT':
  {    console.log('delClient 1');
    if (url_parts.pathname.substr(0, 10) == '/delClient') {
      console.log('delClient 2');
      if (url_parts.pathname.substr(11) == '') {
        console.log("!!!START delClient counterClients: "+ messages.scope.counterClients);
        messages.scope.counterClients--;
        console.log("!!!END delClient counterClients: "+ messages.scope.counterClients);
        res.end();      

      } else {res.statusCode = 400;res.end();}
    } 
    else if (arrUrls.includes(url_parts.pathname.substr(0))){res.statusCode=405;res.end();}
    else {res.statusCode = 404;res.end();}
    break;
  }
  case 'OPTIONS':
  {
    res.statusCode = 204;res.end();
    break;
  }
  default:


    
}


//  if(method === 'DELETE') {
//       // req.on('data', function(chunk){
//         //console.log("START DELETE");
//       // });
// } else if (url_parts.pathname.substr(0, 100) == '/delClient') {
// } else if (url_parts.pathname.substr(0,9) == '/delPoll') {
// } else if(url_parts.pathname.substr(0, 9) == '/messages' && method ==  'GET') {
// } else if(url_parts.pathname.substr(0, 9) == '/messages' && method == 'POST') {
// }else if (url_parts.pathname.substr(0) == '/stats') {
// }else if(url_parts.pathname.substr(0, 9) == '/register') {
// }
// else if (method == 'OPTIONS'){}
}).listen(9000, 'localhost');
//console.log('Server running.');

















// var MD5 = function (string) {
  
//      function RotateLeft(lValue, iShiftBits) {
//              return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
//      }
  
//      function AddUnsigned(lX,lY) {
//              var lX4,lY4,lX8,lY8,lResult;
//              lX8 = (lX & 0x80000000);
//              lY8 = (lY & 0x80000000);
//              lX4 = (lX & 0x40000000);
//              lY4 = (lY & 0x40000000);
//              lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
//              if (lX4 & lY4) {
//                      return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
//              }
//              if (lX4 | lY4) {
//                      if (lResult & 0x40000000) {
//                              return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
//                      } else {
//                              return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
//                      }
//              } else {
//                      return (lResult ^ lX8 ^ lY8);
//              }
//      }
  
//      function F(x,y,z) { return (x & y) | ((~x) & z); }
//      function G(x,y,z) { return (x & z) | (y & (~z)); }
//      function H(x,y,z) { return (x ^ y ^ z); }
//      function I(x,y,z) { return (y ^ (x | (~z))); }
  
//      function FF(a,b,c,d,x,s,ac) {
//              a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
//              return AddUnsigned(RotateLeft(a, s), b);
//      };
  
//      function GG(a,b,c,d,x,s,ac) {
//              a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
//              return AddUnsigned(RotateLeft(a, s), b);
//      };
  
//      function HH(a,b,c,d,x,s,ac) {
//              a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
//              return AddUnsigned(RotateLeft(a, s), b);
//      };
  
//      function II(a,b,c,d,x,s,ac) {
//              a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
//              return AddUnsigned(RotateLeft(a, s), b);
//      };
  
//      function ConvertToWordArray(string) {
//              var lWordCount;
//              var lMessageLength = string.length;
//              var lNumberOfWords_temp1=lMessageLength + 8;
//              var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
//              var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
//              var lWordArray=Array(lNumberOfWords-1);
//              var lBytePosition = 0;
//              var lByteCount = 0;
//              while ( lByteCount < lMessageLength ) {
//                      lWordCount = (lByteCount-(lByteCount % 4))/4;
//                      lBytePosition = (lByteCount % 4)*8;
//                      lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
//                      lByteCount++;
//              }
//              lWordCount = (lByteCount-(lByteCount % 4))/4;
//              lBytePosition = (lByteCount % 4)*8;
//              lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
//              lWordArray[lNumberOfWords-2] = lMessageLength<<3;
//              lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
//              return lWordArray;
//      };
  
//      function WordToHex(lValue) {
//              var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
//              for (lCount = 0;lCount<=3;lCount++) {
//                      lByte = (lValue>>>(lCount*8)) & 255;
//                      WordToHexValue_temp = "0" + lByte.toString(16);
//                      WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
//              }
//              return WordToHexValue;
//      };
  
//      function Utf8Encode(string) {
//              string = string.replace(/\r\n/g,"\n");
//              var utftext = "";
  
//              for (var n = 0; n < string.length; n++) {
  
//                      var c = string.charCodeAt(n);
  
//                      if (c < 128) {
//                              utftext += String.fromCharCode(c);
//                      }
//                      else if((c > 127) && (c < 2048)) {
//                              utftext += String.fromCharCode((c >> 6) | 192);
//                              utftext += String.fromCharCode((c & 63) | 128);
//                      }
//                      else {
//                              utftext += String.fromCharCode((c >> 12) | 224);
//                              utftext += String.fromCharCode(((c >> 6) & 63) | 128);
//                              utftext += String.fromCharCode((c & 63) | 128);
//                      }
  
//              }
  
//              return utftext;
//      };
  
//      var x=Array();
//      var k,AA,BB,CC,DD,a,b,c,d;
//      var S11=7, S12=12, S13=17, S14=22;
//      var S21=5, S22=9 , S23=14, S24=20;
//      var S31=4, S32=11, S33=16, S34=23;
//      var S41=6, S42=10, S43=15, S44=21;
  
//      string = Utf8Encode(string);
  
//      x = ConvertToWordArray(string);
  
//      a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
  
//      for (k=0;k<x.length;k+=16) {
//              AA=a; BB=b; CC=c; DD=d;
//              a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
//              d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
//              c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
//              b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
//              a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
//              d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
//              c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
//              b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
//              a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
//              d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
//              c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
//              b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
//              a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
//              d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
//              c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
//              b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
//              a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
//              d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
//              c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
//              b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
//              a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
//              d=GG(d,a,b,c,x[k+10],S22,0x2441453);
//              c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
//              b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
//              a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
//              d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
//              c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
//              b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
//              a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
//              d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
//              c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
//              b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
//              a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
//              d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
//              c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
//              b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
//              a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
//              d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
//              c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
//              b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
//              a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
//              d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
//              c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
//              b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
//              a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
//              d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
//              c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
//              b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
//              a=II(a,b,c,d,x[k+0], S41,0xF4292244);
//              d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
//              c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
//              b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
//              a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
//              d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
//              c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
//              b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
//              a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
//              d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
//              c=II(c,d,a,b,x[k+6], S43,0xA3014314);
//              b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
//              a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
//              d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
//              c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
//              b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
//              a=AddUnsigned(a,AA);
//              b=AddUnsigned(b,BB);
//              c=AddUnsigned(c,CC);
//              d=AddUnsigned(d,DD);
//          }
  
//        var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);
  
//        return temp.toLowerCase();
//   }