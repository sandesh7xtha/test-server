const router = require("express").Router();
const messageModel = require("../Models/messageModels");

router.post("/addMsg", async (req, res, next) => {
  try {
    const { from, to, message } = req.body;
    const data = await messageModel.create({
      message: { text: message },
      users: [from, to],
      sender: from,
    });
    if (data) return res.json({ msg: "message added successfully." });
    return res.json({ msg: "failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }
});

router.post("/getMsg", async (req, res, next) => {
  try {
    const { from, to } = req.body;
    console.log(req.body);
    const messages = await messageModel
      .find({
        users: {
          $all: [from, to],
        },
      })
      .sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
      };
    });
    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
});

module.exports = router;
