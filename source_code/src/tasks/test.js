let task = require("./randomRoomJoin.task");

// setInterval(() => {
//   task().then((result) => {});
// }, 1000);
task().then(async (result) => {
  while (result) {
    result = await task();
  }
});