var scope = function () {
    return {
        counterClients: 0
    }

}();
var clientMessagesIdDict = [],
    messages = {},
    clients = [],
    clientsForStats = [],
    clientsForDel = [],
    idMsgCtr = 0,
    md5 = require('./md5.js'),
    method = '';


getMessages = function (counter) {
    var messagesString = [];
    var messagesArr = Object.keys(messages).map(function (key) {
        return messages[key];
    });

    for (i = counter; i < Object.keys(messages).length; ++i) {
        messagesString.push(messagesArr[i]);
    }
    return messagesString;
};

addMessage = function (msgObj) {
    var id = idMsgCtr++;
    id = 'msg-id-' + id;
    var count;
    if (messages)
        count = messages.length + 1;
    else
        count = 0;

    msgObj.count = count;
    msgObj.id = id;
    messages[id] = msgObj; //insert to message dictionary

    var tmpArrToSendCurrMessage = [];
    tmpArrToSendCurrMessage.push(msgObj);
    var tmp = JSON.stringify(tmpArrToSendCurrMessage);

    while (clients.length > 0) { /* sending the new message to all clients */
        var client = clients.pop();
        client.end(tmp);
    }
    updateStats();
    return id;


};



updateStats = function () {

    while (clientsForStats.length > 0) {
        var client = clientsForStats.pop();
        var statsJson = {
            clients: scope.counterClients,
            messages: Object.keys(messages).length
        };
        client.end(JSON.stringify(statsJson));
    }

};



register = function (email) {
    var hash = md5.md5(email);
    var profilePicSrc = 'https://secure.gravatar.com/avatar/' + hash;
    updateStats();
    return profilePicSrc;
};

deleteMessage = function (idMessageToDel) {

    if (messages[idMessageToDel] == null) {
        return -1;
    }
    delete messages[idMessageToDel];
    updateStats();
    for (client in clientsForDel) {
        var jsonMsgRes = {
            msg: 'client should delete message id: ',
            id: idMessageToDel
        };
        clientsForDel[client].end(JSON.stringify(jsonMsgRes));
    }
    for (client in clientsForDel) {
        clientsForDel.pop();

    }

    return 1;
};







module.exports = {
    deleteMessage,
    getMessages,
    register,
    addMessage,
    clientsForStats,
    clientMessagesIdDict,
    messages,
    clients,
    idMsgCtr,
    clientsForDel,
    scope,
    method
};