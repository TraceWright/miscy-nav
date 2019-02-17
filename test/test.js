var sinon = require("sinon");
var sinonTest = require('sinon-test');
var test = sinonTest(sinon);
var assert = require('assert');
var tk = require('timekeeper');

var main = require('../index');

msg = (messages) => {
	ret = {};
	ret.channel = {};
	ret.channel.id = "525556985354256405";
	ret.content = messages;
	return ret;
}

const post = (channelId, message) => {
    console.info(channelId, message);
}

describe('Testing Messages', function() {
	it('Simple Post', test(function() {
		var clientMock = this.stub(main, 'post').callsFake(post);
		tk.freeze(new Date(1330688329321));

		main.incomingMessage(msg('T5 pride 9.50'));

		assert(clientMock.called);
		// expect([1,2,3].indexOf(4), -1);
	}));
});

