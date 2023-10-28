const express=require("express");
const CategoryService=require("../services/category.service");

async function createCategory(req,res){

    try {
        const category=await CategoryService.createCategory(req.body);

        return res.status(200).send({category})

    } catch (error) {
        return res.status(500).send({error:error.message})
    }
}
async function getAllCategory(req,res){

    try {
        const category=await CategoryService.getAllCategory(req.query);

        return res.status(200).send({category})

    } catch (error) {
        return res.status(500).send({error:error.message})
    }
}
async function deleteCategory(req,res){

    try {
        const category=await CategoryService.deleteCategory(req.body);

        return res.status(200).send({category})

    } catch (error) {
        return res.status(500).send({error:error.message})
    }
}
async function updateCategory(req,res){

    try {
        const category=await CategoryService.updateCategory(req.body);

        return res.status(200).send({category})

    } catch (error) {
        return res.status(500).send({error:error.message})
    }
}
module.exports={createCategory,getAllCategory,deleteCategory,updateCategory};