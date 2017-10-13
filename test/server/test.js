'use strict';

let assert = require('assert');
let messages = require('../../server/messages-util');

describe('Message', function() {
  it('should load the messages module', function() {
    assert.notEqual(null, messages);
  });
  it('should be able to add a new message and return id', function() {
    let message = {message: '1'};
    let id = messages.addMessage(message);
    assert.notEqual(null, id);
  });
  it('should return new messages', function() {
    let all = messages.getMessages(0);
    let newMessage = {message: '2'};
    messages.addMessage(newMessage);
    let newMessages = messages.getMessages(all.length);
    assert.deepEqual(newMessages, [newMessage]);
  });
  it('should be able to delete a message', function() {
    let message = {message: '3'};
    let id = messages.addMessage(message);
    messages.deleteMessage(id);
    assert.equal(null, messages.getMessages(0).find(m => m.id === id));
  });
});

var chai = require('chai'),
chaiHttp = require('chai-http');



chai.use(chaiHttp);
var expect = chai.expect;

var url;

describe('Server ', function () {
before(function () {
    url = 'http://localhost:9000/';
});

beforeEach(function () {});

describe('Test responses of server', function () {
    console.log('Test responses of server');
    it('should respond with status code 404- message id not found', function (done) {
        console.log('should respond with status code 404- message id not found');
        chai.request(url + 'messages/')
            .del('20000')
            .send()
            .end(function (err, res) {
                expect(res).to.have.status(404);
                done();
            })

    });
    it('should respond with status code 404 - url not found', function (done) {
        console.log('should respond with status code 404 - url not found');
        chai.request(url + 'raz')
            .get('')
            .send()
            .end(function (err, res) {
                expect(res).to.have.status(404);
                done();
            })

    });
    it('should respond with status code 400 - bad request', function (done) {
        console.log('should respond with status code 400 - bad request');
        chai.request(url + 'messages?raz')
            .get('')
            .send()
            .end(function (err, res) {
                expect(res).to.have.status(400);
                done();
            })
    });
    it('should respond with status code 400 - bad request', function (done) {
        console.log('should respond with status code 400 - bad request');
        chai.request(url + 'messages?counter=I am not vegan!')
            .get('')
            .send()
            .end(function (err, res) {
                expect(res).to.have.status(400);
                done();
            })
    });
    it('should respond with status code 405 - wrong verb', function (done) {
        console.log('should respond with status code 405 - wrong verb');
        chai.request(url + 'stats')
            .post('')
            .send()
            .end(function (err, res) {
                expect(res).to.have.status(405);
                done();
            })
    });


});


});
