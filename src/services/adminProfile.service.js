const adminProfile = require("../models/adminProfile.model");
async function createAdminProfile(profile) {
    let search = []
    if (profile?.logo) {
        search.push({ logo: profile.logo })
    }
    if (profile?.companyName) {
        search.push({ companyName: profile.companyName })
    }
    const profileExist = await adminProfile.findOne({ $and: search })
    if (profileExist) {
        return {
            success: false,
            message: "profile Already Exist"
        }
    }
    const profiles = await new adminProfile(Object.assign(...search));
    const createdprofile = await profiles.save();
    return {
        success:true,
        message:"profile created successfuly",
        createdprofile
    };
}
async function getAdminProfile() {
 
    const profile = await adminProfile.findOne({}).sort({createdAt:-1})
    return {
        success:true,
        message:"profile created successfuly",
        profile
    };
}
module.exports = { getAdminProfile, createAdminProfile};