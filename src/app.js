const express = require("express");
const userRouter = require("./routes/user");

const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
  console.log(`Incoming ${req.method} ${req.url}`);
  next();
});

app.use("/api/user", userRouter);

app.use((req, res) =>
  res.status(404).json({ success: false, error: "Route not found" })
);

app.listen(port, () => console.log(`Server listening on port ${port}`));
