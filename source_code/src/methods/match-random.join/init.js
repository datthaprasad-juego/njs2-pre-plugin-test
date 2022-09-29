
class MatchRandomJoinInitalize extends baseInitialize {

  constructor() {
    super();
    this.initializer =  this.loadIntializer("njs2-match-random/join");
    this.initializer.isSecured = false;//this.initializer.isSecured; // values: true/false
    this.initializer.requestMethod = this.initializer.requestMethod; // requestMethod: ['GET', 'POST', 'PUT', 'DELETE']
  }

  getParameter() {
    const param = {
    };

    return { ...this.initializer.param, ...param };
  }
}

module.exports = MatchRandomJoinInitalize;