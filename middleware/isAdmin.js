const { Community } = require("../models/Community");

async function isAdmin(req, res, next) {
  let community = await Community.findById(req.params.id);

  community.moderators.forEach((moderator) => {
    if (moderator.equals(req.user._id)) {
      next();
    } else {
      res.status(400);
    }
  });
}

module.exports = isAdmin;
