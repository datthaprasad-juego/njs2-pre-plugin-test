let constant = [];

constant.MAX_WAITING_TIME = 60; // 30 seconds
constant.WAITING_USER_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,
  ROOM_USER: 2,
};
constant.ROOM_CONDITION_TYPE = {
  //normal matching with 2 people
  1: {
    MAXIMUM_PLAYER: 2,
  },
  //normal matching with 4 people
  2: {
    MAXIMUM_PLAYER: 4,
  },
  //normal matching with 6 people
  3: {
    MAXIMUM_PLAYER: 6,
  },
};
constant.ROOM_TYPES_ARRAY = [1,2,3];
constant.ACTIVE = 1;
constant.INACTIVE = 0;
constant.ROOM_USER = 2;

constant.USER_ID = 1;

// constant.CONNECTION_HANDLER_METHOD = null;
// constant.DISCONNECTION_HANDLER_METHOD = null;

module.exports = constant;
