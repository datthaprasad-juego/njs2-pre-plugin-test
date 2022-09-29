class JoinRandomRoomInitalize extends baseInitialize {
  constructor() {
    super();
    this.initializer = {};
    this.initializer.isSecured = false;
    this.initializer.requestMethod = ["POST"];
  }

  getParameter() {
    const param = {
      roomType: {
        name: "room_type",
        type: "number",
        description:
          "It depends on developer, For ex: 1- No condition, 2- Country Matching, 3- International Matching, 4- Bid Matching, so on...",
        required: true,
        default: "",
      },
      matchMakingParams: {
        name: "match_making_condition",
        type: "object",
        description: "object of conditions",
        required: false,
        default: {},
      },
    };

    return { ...param };
  }
}

module.exports = JoinRandomRoomInitalize;
