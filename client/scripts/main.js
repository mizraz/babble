window.onbeforeunload = function () {
  if (Babble.countPeople > 0) {
    var xmlhttpDelClient = new XMLHttpRequest();
    xmlhttpDelClient.open('PUT', 'http://localhost:9000/delClient', false);
    xmlhttpDelClient.onreadystatechange = function () {
      /* NOTHING DONE IN HERE*/
    };

    xmlhttpDelClient.send( /*JSON.stringify(clientToDelJson)*/ );
  }

  Babble.localStorageVar = JSON.parse(localStorage.getItem('babble'));
  Babble.localStorageVar.currentMessage = Babble.ta.value;
  localStorage.setItem('babble', JSON.stringify(Babble.localStorageVar));
}

window.onload = function () {
  Babble.modal = document.getElementById('modal');
  Babble.modalSave = document.getElementById('modal-btn-save');
  Babble.modalAnnonym = document.getElementById('modal-btn-annonym');
  Babble.modalName = document.getElementById('modal-name');
  Babble.modalEmail = document.getElementById('modal-email');
  Babble.objDiv = document.getElementById('chati');
  Babble.btn = document.getElementById('button-send');
  Babble.ta_span = document.getElementById('ta-span-message');
  Babble.ta = document.getElementById('ta-message');
  Babble.ta.addEventListener('input', function () {});

  if (localStorage.getItem('babble') === null) {
    Babble.localStorageVar = {
      userInfo: {
        name: '',
        email: ''
      },
      currentMessage: ''
    };
    localStorage.setItem('babble', JSON.stringify(Babble.localStorageVar));
  } else {
    try {
      Babble.ta.value = JSON.parse(localStorage.getItem('babble')).currentMessage;
      var container = document.querySelector('.ta-message-container');
      var area = container.querySelector('textarea');
      var clone = container.querySelector('span');
      clone.textContent = area.value + '\n';

      var curUserInfo = JSON.parse(localStorage.getItem('babble')).userInfo;
      Babble.register(curUserInfo);
    } catch (e) {
      // console.log(curUserInfo);
    }
    Babble.modal.style.display = 'none';
  }

  Babble.objDiv.scrollTop = Babble.objDiv.scrollHeight;

  Babble.modalSave.addEventListener('click', function () {
    var curName = Babble.modalName.value;
    Babble.name = curName;

    var curEmail = Babble.modalEmail.value;
    Babble.email = curEmail;
    var curUserInfo = {
      name: curName,
      email: curEmail
    };
    Babble.profilePicSrc = Babble.register(curUserInfo);
    Babble.modal.style.display = 'none';
  });

  Babble.modalAnnonym.addEventListener('click', function () {
    var curUserInfo = {
      name: "Annonymous",
      email: "Annonymous"
    }
    Babble.name = "Annonymous";
    Babble.email = "Annonymous";

    Babble.register(curUserInfo);

    Babble.profilePicSrc = 'images/annonymous.png';
    Babble.modal.style.display = 'none';
  });

  Babble.btn.addEventListener('click', function () {
    var messageText = Babble.ta_span.textContent;
    var msgJson = {
      name: Babble.name,
      email: Babble.email,
      message: messageText,
      timestamp: new Date(),
      profilePicSrc: Babble.profilePicSrc
    };

    Babble.postMessage(msgJson, function (response) {
      Babble.ta_span.textContent = '';
      Babble.ta.value = '';
      Babble.localStorageVar.currentMessage = "";
      localStorage.setItem('babble', JSON.stringify(Babble.localStorageVar));
    });
  }, false);
};


Babble = {
  localStorageVar: '',
  modal: document.getElementById('modal'),
  modalSave: document.getElementById('modal-btn-save'),
  modalAnnonym: document.getElementById('modal-btn-annonym'),
  modalName: document.getElementById('modal-name'),
  modalEmail: document.getElementById('modal-email'),
  objDiv: document.getElementById('chati'),
  btn: document.getElementById('button-send'),
  ta_span: document.getElementById('ta-span-message'),
  ta: document.getElementById('ta-message'),
  delBtn1: '',
  xmlhttpStats: '',
  xmlhttp: '',
  xmlhttpDelPoll: new XMLHttpRequest(),
  xmlhttpMessage: '',
  xmlhttpDel: '',
  counter: 0,
  countMessages: 0,
  countPeople: 0,
  name: '',
  email: '',
  profilePicSrc: '',
  messages: {},
  deleteMessageGui: function (response) {
    var msgToDel = document.getElementById(JSON.parse(response).id);
    Babble.objDiv.removeChild(msgToDel);
    Babble.delPoll();
  },
  //this function was used to delete from chat online.
  delPoll: function () {
    var xmlhttpDelPoll = Babble.xmlhttpDelPoll;
    xmlhttpDelPoll.open('GET', 'http://localhost:9000/delPoll');
    xmlhttpDelPoll.addEventListener('readystatechange', xmlhttpDelPoll.onreadystatechange);
    xmlhttpDelPoll.onreadystatechange = function (response) {
      var lc = Babble.xmlhttpDelPoll;
      var DONE = 4;
      var OK = 200;
      if (lc.readyState === DONE) {
        if (lc.status === OK) {
          var id = JSON.parse(lc.response).id;
          delete Babble.messages[id];
          Babble.delPoll();
        } else if (lc.status == 204) {
          Babble.delPoll();
        }

      }
    };
    xmlhttpDelPoll.send();
  },
  register: function (userInfo) {
    Babble.profilePicSrc = 'images/annonymous.png';
    Babble.localStorageVar = JSON.parse(localStorage.getItem('babble'));
    var curEmail = userInfo.email;
    var curName = userInfo.name;
    var curUserInfo = {
      name: curName,
      email: curEmail
    };
    Babble.localStorageVar.userInfo = curUserInfo;
    localStorage.setItem('babble', JSON.stringify(Babble.localStorageVar));
    Babble.getStats(function (response) {
      if (Babble.xmlhttpStats.readyState === 4 && Babble.xmlhttpStats.status === 200) {
        drawStats(Babble.xmlhttpStats.responseText);
      }
    });

    Babble.name = userInfo.name;
    Babble.email = userInfo.email;
    var xmlhttpRegister = Babble.xmlhttpRegister = new XMLHttpRequest();
    xmlhttpRegister.open('POST', 'http://localhost:9000/register');
    xmlhttpRegister.addEventListener('readystatechange', xmlhttpRegister.onreadystatechange);
    xmlhttpRegister.onreadystatechange = function (response) {
      if (xmlhttpRegister.readyState === 4) {
        if (xmlhttpRegister.status === 200) {
          document.getElementById('count-users').innerHTML =
            " <img class='middle' src='images/clients-logo.png' alt='clients counter'> \  " +
            JSON.parse(xmlhttpRegister.responseText).clients;
          document.getElementById('count-messages').innerHTML =
            " <img class='middle' src='images/messages-logo.png' alt='messages counter'> \  " +
            JSON.parse(xmlhttpRegister.responseText).messages;
          Babble.countMessages = JSON.parse(xmlhttpRegister.responseText).messages;
          Babble.countPeople = JSON.parse(xmlhttpRegister.responseText).clients;

          if (Babble.email != 'Annonymous') {
            Babble.profilePicSrc = JSON.parse(xmlhttpRegister.responseText).profilePicSrc;
          }
        }
      }
    }
    var jsonEmail = {
      email: Babble.email
    };
    xmlhttpRegister.send(JSON.stringify(jsonEmail));
    Babble.getMessages(0, function (arr) {});
    //this was used to del messages online
    Babble.delPoll();
  },
  getStats: function (callback) {
    var xmlhttpStats = new XMLHttpRequest();
    Babble.xmlhttpStats = xmlhttpStats;
    xmlhttpStats.open('GET', 'http://localhost:9000/stats');
    xmlhttpStats.addEventListener("readystatechange", callback);
    xmlhttpStats.onreadystatechange = function (response) {
      var DONE = 4;
      var OK = 200;
      if (xmlhttpStats.readyState === DONE) {
        if (xmlhttpStats.status === OK) {
          callback(xmlhttpStats.responseText); //this callback is drawStats           
          Babble.getStats(function (response) {
            if (Babble.xmlhttpStats.readyState === 4 && Babble.xmlhttpStats.status === 200) {
              drawStats(Babble.xmlhttpStats.responseText);
            }
          });
        } else if (xmlhttpStats.status == 204) {
          Babble.getStats(function (response) {
            if (Babble.xmlhttpStats.readyState === 4 && Babble.xmlhttpStats.status === 200) {
              drawStats(Babble.xmlhttpStats.responseText);
            }

          });
        } else if (xmlhttpStats.status == 404) {
          console.log("response of  stats is error 404");
        }
      }
    };
    xmlhttpStats.send();
  },
  postMessage: function (msgJson, callback) {
    Babble.xmlhttpMessage = new XMLHttpRequest();
    var xmlhttpMessage = Babble.xmlhttpMessage;
    xmlhttpMessage.open('POST', 'http://localhost:9000/messages/');
    xmlhttpMessage.addEventListener("load", callback);
    xmlhttpMessage.onload = function (response) {
      if (xmlhttpMessage.readyState === 4 && xmlhttpMessage.status === 200) {
        callback(JSON.parse(xmlhttpMessage.responseText));
      }
    };
    xmlhttpMessage.send(JSON.stringify(msgJson));
  },
  getMessages: function (counter, callback) {
    var lc = new XMLHttpRequest();
    Babble.xmlhttp = lc;
    lc.open('GET', 'http://localhost:9000/messages?counter=' + counter, true);
    lc.addEventListener("load", callback);
    lc.onload = function (response) {
      var DONE = 4;
      var OK = 200;
      if (lc.readyState == DONE) {
        if (lc.status == OK) {
          var myArr = JSON.parse(lc.responseText);
          Babble.counter += myArr.length;
          callback(myArr);
          drawMessage(myArr);
          Babble.getMessages(Babble.counter, function (arr) {});
        } else if (lc.status == 204) {
          Babble.getMessages(Babble.counter, function (arr) {});
        }
      }
    };
    lc.send();
  },

  deleteMessage: function (msgId, callback) {
    var xmlhttpDel = new XMLHttpRequest();
    Babble.xmlhttpDel = xmlhttpDel;
    xmlhttpDel.open('DELETE', 'http://localhost:9000/messages/' + msgId);
    xmlhttpDel.addEventListener("load", callback);
    xmlhttpDel.onload = function (response) {
      var DONE = 4;
      var OK = 200;
      if (xmlhttpDel.readyState === DONE) {
        if (xmlhttpDel.status === OK) {
          callback(true); //deletes from HTML the msgId msg
        } else if (xmlhttpDel.status === 404)
          console.log("message id not exist so cann't delete it");
      }
    }
    xmlhttpDel.send();
  }
};

makeGrowable(document.querySelector('.ta-message-container'));

function makeGrowable(container) {
  var area = container.querySelector('textarea');
  var clone = container.querySelector('span');
  area.addEventListener('input', function (e) {
    clone.textContent = area.value + '\n';
  });
}

drawStats = function (responseText) {
  statsJson = JSON.parse(responseText);
  Babble.countPeople = statsJson.clients;
  Babble.countMessages = statsJson.messages;

  document.getElementById('count-users').innerHTML =
    " <img alt='clients counter'  class='middle' src='images/clients-logo.png' >" + Babble.countPeople;
  document.getElementById('count-messages').innerHTML =
    " <img alt='messages counter'  class='middle' src='images/messages-logo.png' >" + Babble.countMessages;
};

drawMessage = function (myArr) {
  for (i = 0; i < myArr.length; ++i) {
    var curMessage = myArr[i];
    var name = curMessage.name,
      msgId = curMessage.id,
      email = curMessage.email,
      date = curMessage.date;
    var msgText = curMessage.message,
      dateTime = new Date(date).
    toLocaleTimeString('en-US', {
        hour12: false,
        hour: "numeric",
        minute: "numeric"
      }),
      profilePicSrc = curMessage.profilePicSrc;

    Babble.messages[msgId] = curMessage;
    var newMessage = document.createElement('li');
    newMessage.classList.add('message');
    newMessage.setAttribute("id", msgId);
    var msgIdNumber = (parseInt(msgId.replace(/[^0-9]*/, '')) + 1) * 2;
    newMessage.setAttribute("tabindex", msgIdNumber);

    var msgIdNumberDel = msgIdNumber + 1;
    newMessage.innerHTML = " \
     <div class='sidebar-message'> \
     <img alt='' class='img-circle' src=" + profilePicSrc + "> \
    </div> \n <div class='message-body'> \
    <header class='message-header'> \
      <cite class='message-user-name'>" + name + "</cite> \
      <time datetime=" + date + " class='message-time-sent'>" + dateTime + "</time> \
      <div hidden class='email'>" + email + "</div> \
      <div class='container-button-delete-message'> \
        <button tabindex=" + msgIdNumberDel + " aria-label='Delete message id: " + msgId + "' class='button-delete-message' id='del-msg-btn-" + msgId + "'> \
          <img src='images/delete-btn.png' alt='delete message'> \
        </button> \
        <div class='empty-div-del-btn'> </div> \
      </div> \
    </header> \
    <article class='message-content'> \
      " + msgText + " \
      </article> \
    </div> \
  <!-- end message -->  \
";
    Babble.objDiv.appendChild(newMessage);
    (function () {
      var localMsgId = msgId;

      (document.getElementById('del-msg-btn-' + localMsgId)).addEventListener('click', function () {


        var curMsgEmail = document.getElementById(localMsgId)
          .getElementsByClassName('email')[0];
        var email = curMsgEmail.innerHTML;
        if (Babble.email == email) {
          Babble.deleteMessage(localMsgId, function () {
            /*Do something? not the Gui update thing.*/
          });
        } else {
          console.log("YOU TRIED DEL MESSAGE NOT YOURS! your email vs message email: " + msgId + " " + Babble.email + " " + email);
        }
      });
    }());
  }
};