const { Community } = require("../models/Community");

async function isAdmin(req, res, next) {
  let community;
  if (req.params.id) {
    community = await Community.findById(req.params.id);
  } else if (req.params.username) {
    community = await Community.findOne({ username: req.params.username });
  }

  community.moderators.forEach((moderator) => {
    if (moderator.equals(req.user._id)) {
      next();
    } else {
      res.status(400);
    }
  });
}

module.exports = isAdmin;
