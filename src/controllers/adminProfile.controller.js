const AdminProfileService = require("../services/adminProfile.service");


const createAdminProfile = async (req, res) => {
  try {
    const profile = await AdminProfileService.createAdminProfile(req.body);
    return res.status(202).send(profile);
  } catch (error) {
    res.status(500).send({ error: "Something went wrong" });
  }
};
const getAdminProfile = async (req, res) => {
  try {
    const profile = await AdminProfileService.getAdminProfile();
    return res.status(202).send(profile);
  } catch (error) {
    res.status(500).send({ error: "Something went wrong" });
  }
};

module.exports = {
    createAdminProfile,
    getAdminProfile
};