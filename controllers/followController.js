const assert = require("assert");
const Follow = require("../models/Follow");
const Definer = require("../lib/mistake");

let followController = module.exports;

followController.subscribe = async (req, res) => {
  try {
    console.log(`POST: cont/subscribe`);
    assert.ok(req.member, Definer.auth_err5);

    const { member, body } = req;
    const follow = new Follow();
    const result = await follow.subscribeData(member, body);

    res.json({ state: "success", data: result });
  } catch (err) {
    console.log(`ERROR, cont/subscribe, ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};

followController.unsubscribe = async (req, res) => {
  try {
    console.log(`POST: cont/unsubscribe`);
    assert.ok(req.member, Definer.auth_err5);

    const { member, body } = req;
    const follow = new Follow();
    const result = await follow.unsubscribeData(member, body);

    res.json({ state: "success", data: result });
  } catch (err) {
    console.log(`ERROR, cont/unsubscribe, ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};

followController.getMemberFollowings = async (req, res) => {
  try {
    console.log(`GET: cont/getMemberFollowings`);

    const { query } = req;
    const follow = new Follow();

    const result = await follow.getMemberFollowingsData(query);

    assert.ok(result, Definer.general_err1);

    res.json({ state: "success", data: result });
  } catch (err) {
    console.log(`ERROR, cont/getMemberFollowings, ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};
