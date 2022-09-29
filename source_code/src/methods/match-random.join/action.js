
class MatchRandomJoinAction extends baseAction {

  async executeMethod() {
    this.userObj={user_id:1}
    let res;
    const MatchRandomJoinPkg = this.loadPkg("njs2-match-random/join");
    res = await MatchRandomJoinPkg.execute(this);

    this.setResponse(res.code, [], "njs2-match-random/join");
    return res.data;
  };

}
module.exports = MatchRandomJoinAction;