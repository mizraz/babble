
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
    

    getMessages = function(counter) {
            var messagesString =[];
            //console.log("messages.length:" + Object.keys(messages).length);
            //console.log("counter:" + counter);
            var messagesArr = Object.keys(messages).map(function (key) { return messages[key]; });
            
            for (i=counter; i < Object.keys(messages).length; ++i) {
                //console.log("messages.length:" + Object.keys(messages).length);
              messagesString.push(messagesArr[i]);
              //console.log("messagesArr[i] " + JSON.stringify(messagesArr[i]));
            }
            //console.log("messagesString " + messagesString);
            return messagesString;
    };

    addMessage = function (msgObj) {
        //console.log(msgText);
        //console.log(userName);
        //console.log(email);


        var id = idMsgCtr++;
        id = 'msg-id-'+id;
        var count;
        if (messages)
            count = messages.length + 1;
        else
            count = 0;

        msgObj.count = count;
        msgObj.id = id;
          //console.log("id: "+ msgObj.id);
        messages[id] = msgObj; //insert to message dictionary
        console.log('in addMessage id: '+ id);
        console.log('access to the message inserted '+ messages[id] );
        //console.log(" messages[id] = " +  (JSON.parse(messages[id])).userName);

        var tmpArrToSendCurrMessage = [];
        tmpArrToSendCurrMessage.push(msgObj);
        var tmp =  JSON.stringify(tmpArrToSendCurrMessage);
      
        while(clients.length > 0) {/* sending the new message to all clients */
        var client = clients.pop();
        client.end(tmp);
        }
        updateStats();
        return id;


    };



    updateStats = function() {
        console.log("in updateStats clientsForStats= " + 
        clientsForStats.length);
        console.log("in updateStats counterClients= " + scope.counterClients);
        // scope.counterClients = clientsForStats.length;
        while(clientsForStats.length > 0) {
            var client = clientsForStats.pop();
            var statsJson = {
                clients: scope.counterClients,
                messages: Object.keys(messages).length
            }; 
            client.end(JSON.stringify(statsJson));           
        }
        console.log("end updateStats");
        
    };



    register = function (email) {
        console.log('in register counterPeople: '+scope.counterClients);
        var hash = md5.md5(email);
        //console.log("email: " + email);
        //console.log("hash: " + hash);
        // https://secure.gravatar.com/avatar/696967c52ecc7be8cd5bd16695f49abd
        var profilePicSrc = 'https://secure.gravatar.com/avatar/'+hash;
        //console.log("in register : profilePicSrc: " + profilePicSrc);
        updateStats();
        return profilePicSrc;
    };

    deleteMessage = function (idMessageToDel) {
        console.log("in deleteMessage idToDel: "+idMessageToDel);
        console.log("th message to delete: "+messages[idMessageToDel]);
        
        if (messages[idMessageToDel] == null) {
            console.log("in message-util deleteMessage : message to Del not found");
            return -1;
        }
        delete messages[idMessageToDel];
        console.log("the message to delete should be null: "+messages[idMessageToDel]);
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







   module.exports = {deleteMessage, getMessages, register, addMessage
,clientsForStats, clientMessagesIdDict, messages, clients, idMsgCtr, clientsForDel,
 scope, method};

