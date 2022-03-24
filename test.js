var assert = require("assert");
var api = require("./src/controllers/api");
describe("getInfoData", function () {
  describe("#formatFile()", function () {
    it("should return if file is accepted", async function () {
      let data = await api.getSecretInfo({ url: `secret/file/test2.csv` });
      assert.equal(api.checkTest({ info: data }), true);
      let data3 = await api.getSecretInfo({ url: `secret/file/test3.csv` });
      assert.equal(api.checkTest({ info: data3 }), true);
    });
    it("should return if file is not accepted", async function () {
      let data2 = await api.getSecretInfo({ url: `secret/file/1.csv` });
      assert.equal(api.checkTest({ info: data2 }), false);
      let data4 = await api.getSecretInfo({ url: `secret/file/test4.csv` });
      assert.equal(api.checkTest({ info: data4 }), false);
    });
  });
});
