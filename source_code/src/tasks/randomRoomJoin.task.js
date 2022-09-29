AutoLoad = require("@njs2/base/base/autoload.class");
AutoLoad.loadConfig();
AutoLoad.loadModules();
// const GLB = require("../contract/GLBs");
const ROOM_TYPES_ARRAY = Object.keys(GLB.ROOM_CONDITION_TYPE);

const handler = async () => {
  //check waiting time ends and remove that users
  const timedOutUsers = await SQLManager.find(
    "waiting_user",
    {
      waiting_end_time: { $lt: Date.now() / 1000 },
      status: GLB.WAITING_USER_STATUS.ACTIVE,
    },
    {
      status: GLB.WAITING_USER_STATUS.INACTIVE,
    }
  );
  if (timedOutUsers.length > 0) {
    //update status to inactive , i.e remove from waiting users
    await SQLManager.update(
      "waiting_user",
      {
        user_id: { $in: timedOutUsers.map((user) => user.user_id) },
      },
      {
        status: GLB.WAITING_USER_STATUS.INACTIVE,
      }
    );

    //send socket as timedout from lobby to timedout users
    timedOutUsers.forEach((user) => {
      if (user.socket_id) {
        SOCKETManager.emit(user.socket_id, {
          event: "lobby_timed_out",
          data: {},
        });
      }
    });
  }

  try {
    let user = await SQLManager.findOne(
      "waiting_user",
      {
        status: GLB.WAITING_USER_STATUS.ACTIVE,
        room_type: ROOM_TYPES_ARRAY[0],
      },
      { waiting_end_time: 1 }
    );
    console.log({ user });

    ROOM_TYPES_ARRAY.push(ROOM_TYPES_ARRAY.shift());

    //if no waiting user in queue
    if (!user) return 1;

    const requiredRoomUsersCountMax = user.maximum_players - 1;
    const requiredRoomUsersCountMin = user.minimum_players - 1;

    //If waiting time is over update status
    if (user.waiting_end_time < Date.now() / 1000) {
      await SQLManager.update(
        "waiting_user",
        {
          user_id: user.user_id,
        },
        {
          status: GLB.WAITING_USER_STATUS.INACTIVE,
        }
      );

      if (user.socket_id)
        SOCKETManager.emit(user.socket_id, {
          event: "lobby_timed_out",
          data: {},
        });
    } else {
      // let roomUsers = (
      //   await SQLManager.doExecuteRawQuery(
      //     `SELECT * FROM waiting_user
      //   WHERE status=${constant.WAITING_USER_STATUS.ACTIVE}
      //   AND room_type=${user.room_type}
      //   AND JSON_CONTAINS(match_making_params, '${JSON.stringify(
      //     user.match_making_params
      //   )}')
      //   AND user_id!=${user.user_id}
      //   ORDER BY waiting_start_time ASC
      //   LIMIT ${requiredRoomUsersCountMax}`
      //   )
      // )[0];

      let roomUsers = (
        await SQLManager.doExecuteRawQuery(`
            SELECT * FROM waiting_user
            WHERE status=${GLB.WAITING_USER_STATUS.ACTIVE}
            AND room_type=${user.room_type}
            AND user_id!=${user.user_id}
            ORDER BY waiting_start_time ASC
          `)
      )[0];
      console.log({ roomUsers });

      roomUsers = roomUsers.filter(({ match_making_params }) => {
        console.log({ match_making_params, dp: user.match_making_params });
        return test(match_making_params, user.match_making_params);
      });

      console.log({ roomUsers });
      return;

      //if room users are enough to start the room, i.e minCount <= roomUsers.length <= maxCount
      if (
        roomUsers.length <= requiredRoomUsersCountMax &&
        roomUsers.length > 0 &&
        roomUsers.length >= requiredRoomUsersCountMin
      ) {
        //add user to roomUsers list
        roomUsers.push(user);

        //update waiting users
        await SQLManager.doExecuteRawQuery(`
                  UPDATE waiting_user
                  SET status=${GLB.WAITING_USER_STATUS.ROOM_USER}
                  WHERE user_id IN (${roomUsers
                    .map((user) => user.user_id)
                    .join(",")})
              `);

        //create new room
        let roomId = await SQLManager.insert(
          "room",
          {
            room_type: user.room_type,
          },
          {},
          ["room_id"]
        );

        //add room users in DB
        await SQLManager.doExecuteRawQuery(`
          INSERT INTO room_user (room_id, user_id)
          VALUES ${roomUsers
            .map((user) => `(${roomId}, ${user.user_id})`)
            .join(",")}
          `);

        //send socket to room users
        roomUsers.forEach((user) => {
          if (user.socket_id) {
            SOCKETManager.emit(user.socket_id, {
              event: "room_created",
              data: {
                room_id: roomId,
                room_type: user.room_type,
                room_users: roomUsers.map((user) => user.user_id),
              },
            });
          }
        });
      }
    }
    return 1;
  } catch (e) {
    console.log("match making error: ", e);
    return 0;
  }
};

function test(obj1, obj2) {
  for ([key, value] of Object.entries(obj1)) {
    // console.log({ key, value, d: obj2[key] });
    if (!obj2[key]) return 0;

    if (value.value) {
      if (!obj2[key].value || obj2[key].value != value.value) {
        return 0;
      }
    } else if (value.range) {
      if (
        !obj2[key].range ||
        !(
          (obj2[key].range[0] >= value.range[0] &&
            obj2[key].range[0] <= value.range[1]) ||
          (obj2[key].range[1] >= value.range[0] &&
            obj2[key].range[1] <= value.range[1])
        )
      ) {
        return 0;
      }
    } else if (value.multi_value) {
      if (
        !obj2[key].multi_value ||
        hasNoCommonValues(value.multi_value, obj2[key].multi_value)
      ) {
        return 0;
      }
    }
  }
  return 1;
}

function hasNoCommonValues(array1, array2) {
  if (!array1.length || !array2.length) return 1;
  array1 = array1.filter((item) => array2.includes(item));
  if (!array1.length) return 1;
  return 0;
}
module.exports = handler;
