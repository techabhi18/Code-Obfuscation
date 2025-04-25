const express = require("express");
const userRouter = express.Router();

const userData = [
  { id: 1, name: "First", role: "admin" },
  { id: 2, name: "Second", role: "user" },
];

userRouter.get("/", (req, res) => {
  res.json({ success: true, data: userData });
});

userRouter.get("/:id", (req, res) => {
  const targetUser = userData.find((u) => u.id === parseInt(req.params.id));
  if (!targetUser)
    return res.status(404).json({ success: false, error: "Not found" });
  res.json({ success: true, data: targetUser });
});

module.exports = userRouter;
