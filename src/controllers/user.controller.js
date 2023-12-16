const userService=require("../services/user.service")

const getUserProfile=async (req,res)=>{
    try {
        const jwt= req.headers.authorization?.split(' ')[1];

        if(!jwt){
            return res.status(404).send({error:"token not found"})
        }
        const user=await userService.getUserProfileByToken(jwt)

        return res.status(200).send(user)

    
    } catch (error) {
        console.log("error from controller - ",error)
        return res.status(500).send({error:error.message})
    }
}

const getAllUsers=async(req,res)=>{
    try {
        const users=await userService.getAllUsers()
        return res.status(200).send(users)
    } catch (error) {
        return res.status(500).send({error:error.message})
    }
}
const updateProfile=async(req,res)=>{
    try {
        const jwt= req.headers.authorization?.split(' ')[1];

        if(!jwt){
            return res.status(404).send({error:"token not found"})
        }
        const user=await userService.updateUserProfileByToken(jwt,req.body)

        return res.status(200).send(user)

    
    } catch (error) {
        console.log("error from controller - ",error)
        return res.status(500).send({error:error.message})
    }
}
const addAddress=async(req,res)=>{
    try {
        const jwt= req.headers.authorization?.split(' ')[1];

        if(!jwt){
            return res.status(404).send({error:"token not found"})
        }
        const user=await userService.addAddress(jwt,req.body)

        return res.status(200).send({user,success:true,message:"address created successfully"})

    
    } catch (error) {
        console.log("error from controller - ",error)
        return res.status(500).send({error:error.message})
    }
}
const updateAddress=async(req,res)=>{
    try {
        const jwt= req.headers.authorization?.split(' ')[1];

        if(!jwt){
            return res.status(404).send({error:"token not found"})
        }
        const address=await userService.updateAddress(jwt,req.body)

        return res.status(200).send({address,success:true,message:"address updated successfully"})

    
    } catch (error) {
        console.log("error from controller - ",error)
        return res.status(500).send({error:error.message})
    }
}
const deleteAddress=async(req,res)=>{
    try {
        const jwt= req.headers.authorization?.split(' ')[1];

        if(!jwt){
            return res.status(404).send({error:"token not found"})
        }
        const address=await userService.deleteAddress(jwt,req.body)

        return res.status(200).send({address,success:true,message:"address updated successfully"})

    
    } catch (error) {
        console.log("error from controller - ",error)
        return res.status(500).send({error:error.message})
    }
}

module.exports={getUserProfile,getAllUsers,updateProfile,addAddress,updateAddress,deleteAddress}