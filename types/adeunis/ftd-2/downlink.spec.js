const chai = require("chai");
const rewire = require("rewire");

const assert = chai.assert;

const script = rewire("./downlink.js");
const consume = script.__get__("consume");

function expectEmit(callback) {
  script.__set__({
    emit: callback,
  });
}

describe("Adeunis FTD-2 Downlink", function () {
  describe("consume()", function () {
    it("should encode Adeunis payload", function (done) {
      let data = {
        payload: {
          message: "Test"
        }
      };

      expectEmit(function (type, value) {
        assert.equal(type, "downlink");
        assert.isNotNull(value);
        assert.typeOf(value, "object");
        assert.equal(value.port, 1);
        assert.equal(value.confirmed, false);
        assert.equal(value.payload_hex, "54657374");
        done();
      });

      consume(data);
    });

    it("should encode Adeunis payload with specific port and confirmed", function (done) {
      let data = {
        payload: {
          message: "Test"
        },
        confirmed: true,
        port: 123
      };

      expectEmit(function (type, value) {
        assert.equal(type, "downlink");
        assert.isNotNull(value);
        assert.typeOf(value, "object");
        assert.equal(value.port, 123);
        assert.equal(value.confirmed, true);
        assert.equal(value.payload_hex, "54657374");
        done();
      });

      consume(data);
    });
  });
});
