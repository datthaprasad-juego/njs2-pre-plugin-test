class JoinRandomRoomAction extends baseAction {
  async executeMethod() {
    try {
      let { userObj, roomType, matchMakingParams } = this;

      userObj = {user_id:1}

      //Variable section
      let waitinUserdetails;

      /*<----------- FIND WAITING USER ----------->*/
      {
        waitinUserdetails = await SQLManager.findOne("waiting_user", {
          user_id: userObj.user_id,
        });
      }

      /*<------------ CREATE USER IF NOT IN WAITING USERS ------------>*/
      {
        if (!waitinUserdetails) {
          await SQLManager.insert("waiting_user", {
            user_id: userObj.user_id,
            room_type: roomType,
            waiting_start_time: Date.now() / 1000,
            waiting_end_time: Date.now() / 1000 + GLB.MAX_WAITING_TIME,
            maximum_players: GLB.ROOM_CONDITION_TYPE[roomType].MAXIMUM_PLAYER,
            minimum_players: GLB.ROOM_CONDITION_TYPE[roomType].MINIMUM_PLAYER
              ? GLB.ROOM_CONDITION_TYPE[roomType].MINIMUM_PLAYER
              : 0,
            match_making_params: matchMakingParams,
          });
        }
      }

      /*<------------ IF USER ALREADY PLAYING (ALREADY ROOM USER), WARN USER ------------>*/
      {
        if (
          waitinUserdetails &&
          waitinUserdetails.status === GLB.WAITING_USER_STATUS.ROOM_USER
        ) {
          return {
            code: "FAILED",
            data: {
              error: "You are already playing",
              user_id: userObj.user_id,
            },
          };
        }
      }

      /*<------------ UPDATE USER IF ALREADY IN WAITING USERS QUEUE AND NOT PLAYING ANY GAME ------------>*/
      {
        if (
          waitinUserdetails &&
          (waitinUserdetails.status === GLB.WAITING_USER_STATUS.INACTIVE ||
            (waitinUserdetails.status === GLB.WAITING_USER_STATUS.ACTIVE &&
              waitinUserdetails.waiting_start_time < Date.now() / 1000))
        ) {
          await SQLManager.update(
            "waiting_user",
            {
              user_id: userObj.user_id,
            },
            {
              status: GLB.WAITING_USER_STATUS.ACTIVE,
              room_type: roomType,
              waiting_start_time: Date.now() / 1000,
              waiting_end_time: Date.now() / 1000 + GLB.MAX_WAITING_TIME,
              maximum_players:
                GLB.ROOM_CONDITION_TYPE[roomType].MAXIMUM_PLAYER,
              minimum_players: GLB.ROOM_CONDITION_TYPE[roomType].MINIMUM_PLAYER
                ? GLB.ROOM_CONDITION_TYPE[roomType].MINIMUM_PLAYER
                : 0,
              match_making_params: matchMakingParams,
            }
          );
        }
      }

      this.setResponse("SUCCESS")
      return {
        code: "SUCCESS",
        data: {},
      };
    } catch (error) {
      console.log({error});
      return { code: "ERROR", data: error.message };
    }
  }
}
module.exports = JoinRandomRoomAction;
