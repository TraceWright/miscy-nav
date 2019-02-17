var sinon = require("sinon");
var assert = require('assert');
var tk = require('timekeeper');

msg = (messages) => {
	ret = {};
	ret.channel = {};
	ret.channel.id = "525556985354256405";
	ret.content = messages;
	return ret;
}

const post = (channelId, message) => {
    console.info("TestingOutput ", channelId, message);
}

describe('Testing Messages', function() {
	var main = require('../index');
	var clientMock = sinon.stub(main, 'post').callsFake(post);

	it('Simple Egg Post dot time', function() {
		clientMock.reset();
		tk.freeze(new Date(1330688329321));

		main.incomingMessage(msg('T5 pride 9.50'));

		assert(clientMock.calledOnce);
		assert(clientMock.calledWith("525517549887029248", "$egg 5 \"pride\" 12"));
	});

	it('Simple Egg Post colon time', function() {
		clientMock.reset();
		tk.freeze(new Date(1330688329321));

		main.incomingMessage(msg('T5 pride 9:50'));

		assert(clientMock.calledOnce);
		assert(clientMock.calledWith("525517549887029248", "$egg 5 \"pride\" 12"));
	});
});

