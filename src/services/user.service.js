const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user.model.js');
const Addresses = require('../models/address.model.js');
const jwtProvider = require("../config/jwtProvider")

const createUser = async (userData) => {
    try {

        let { firstName, lastName, email, password, role } = userData;

        const isUserExist = await User.findOne({ email });


        if (isUserExist) {
            throw new Error("user already exist with email : ", email)
        }

        password = await bcrypt.hash(password, 8);

        const user = await User.create({ firstName, lastName, email, password, role })

        console.log("user ", user)

        return user;

    } catch (error) {
        console.log("error - ", error.message)
        throw new Error(error.message)
    }

}

const findUserById = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("user not found with id : ", userId)
        }
        return user;
    } catch (error) {
        console.log("error :------- ", error.message)
        throw new Error(error.message)
    }
}

const getUserByEmail = async (email) => {
    try {

        const user = await User.findOne({ email });

        if (!user) {
            throw new Error("user found with email : ", email)
        }

        return user;

    } catch (error) {
        console.log("error - ", error.message)
        throw new Error(error.message)
    }
}

const getUserProfileByToken = async (token) => {
    try {

        const userId = jwtProvider.getUserIdFromToken(token)

        console.log("userr id ", userId)


        const user = await (await findUserById(userId)).populate("addresses");
        user.password = null

        if (!user) {
            throw new Error("user not exist with id : ", userId)
        }
        return user;
    } catch (error) {
        console.log("error ----- ", error.message)
        throw new Error(error.message)
    }
}
const updateUserProfileByToken = async (token, body) => {
    try {

        const userId = jwtProvider.getUserIdFromToken(token)

        console.log("userr id ", userId)
        delete body.password
        delete body.addresses
        delete body.email
        const user = await User.findByIdAndUpdate({ _id: userId }, body, { returnOriginal: false });
        delete user.password

        if (!user) {
            throw new Error("user not exist with id : ", userId)
        }
        await user.populate('addresses')
        return user;
    } catch (error) {
        console.log("error ----- ", error.message)
        throw new Error(error.message)
    }
}
const addAddress = async (token, body) => {
    try {

        const userId = jwtProvider.getUserIdFromToken(token)

        console.log("userr id ", userId)
        body.user = userId

        const address = await Addresses.create(body);
        const user = await User.findById(userId)
        await user.addresses.push(address)
        await user.save()

        if (!address) {
            throw new Error("user not exist with id : ", userId)
        }

        return address;
    } catch (error) {
        console.log("error ----- ", error.message)
        throw new Error(error.message)
    }
}
const deleteAddress = async (token, body) => {
    try {

        const userId = jwtProvider.getUserIdFromToken(token)

        console.log("userr id ", userId)

        const address = await Addresses.deleteOne({ _id: body._id });
        const user = await User.findById(userId)
        await user.addresses.remove(body._id)
        await user.save()

        if (!address) {
            throw new Error("user not exist with id : ", userId)
        }

        return address;
    } catch (error) {
        console.log("error ----- ", error.message)
        throw new Error(error.message)
    }
}
const updateAddress = async (token, body) => {
    try {
        const { _id } = body
        const userId = jwtProvider.getUserIdFromToken(token)
        const address = await Addresses.findByIdAndUpdate(_id, body, { new: true });
        if (!address) {
            throw new Error("user not exist with id : ", userId)
        }

        return address;
    } catch (error) {
        console.log("error ----- ", error.message)
        throw new Error(error.message)
    }
}
const updatePassword = async (body) => {
    try {

        const { password, email } = body
        const password1 = await bcrypt.hash(password, 8);
        const user = await User.findOneAndUpdate({ email: email }, { password: password1 }, { returnOriginal: false });
        delete user.password

        if (!user) {
            throw new Error("user not exist with id : ", email)
        }
        await user.populate('addresses')
        return user;
    } catch (error) {
        console.log("error ----- ", error.message)
        throw new Error(error.message)
    }
}

const getAllUsers = async () => {
    try {
        const users = await User.find();
        return users;
    } catch (error) {
        console.log("error - ", error)
        throw new Error(error.message)
    }
}
const getAllUsersByRole = async (query) => {
    try {
        let search = [{isActive:true},{isDeleted:false}]
        var pageNumber = 1;
        var pageSize = 0;
        if (query?.pageNumber && Number(query.pageNumber)) {
          pageNumber = Number(query.pageNumber);
        }
        if (query?.pageSize && Number(query.pageSize)) {
          pageSize = Number(query.pageSize);
        }
       
        if (query?.role) {
            search.push({role:query?.role})
        }
        const UsersCount = await User
        .find({ $and: search })
        .countDocuments();
      var numberOfPages = pageSize === 0 ? 1 : Math.ceil(UsersCount / pageSize);
      const Userlist =await User.aggregate([
        { $match: { $and: search } },
        {$lookup:{
            from: 'addresses',
            localField: 'addresses',
            foreignField: '_id',
            as: 'addresses',
        }},
        { $sort: { createdAt: -1 } },
        { $skip: (pageNumber - 1) * pageSize },
        { $limit: pageSize ? pageSize : Number.MAX_SAFE_INTEGER },
      ]);
        return {
            success:true,
            message:"user list",
            Userlist,
            numberOfPages,
            UsersCount 
        };
    } catch (error) {
        console.log("error - ", error)
        throw new Error(error.message)
    }
}
module.exports = {
    createUser,
    findUserById,
    getUserProfileByToken,
    getUserByEmail,
    getAllUsers,
    getAllUsersByRole,
    updateUserProfileByToken,
    updatePassword,
    addAddress,
    updateAddress,
    deleteAddress
}