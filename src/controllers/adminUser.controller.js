
const userService = require("../services/user.service");

const getAllUsersByRole = async (req, res) => {
  try {
    const userList = await userService.getAllUsersByRole(req.query);
    return res.status(202).send(userList);
  } catch (error) {
    res.status(500).send({ error: "Something went wrong" });
  }
};


module.exports = {
    getAllUsersByRole
};
