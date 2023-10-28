const express=require("express");
const CarouselService=require("../services/carousel.service");

async function createCarousel(req,res){

    try {
        const carousel=await CarouselService.createCarousel(req.body);

        return res.status(200).send({carousel})

    } catch (error) {
        return res.status(500).send({error:error.message})
    }
}
async function getCarousel(req,res){

    try {
        const carousel=await CarouselService.getCarousel(req.query);

        return res.status(200).send({carousel})

    } catch (error) {
        return res.status(500).send({error:error.message})
    }
}
async function deleteCarousel(req,res){

    try {
        const carousel=await CarouselService.deleteCarousel(req.body);

        return res.status(200).send({carousel})

    } catch (error) {
        return res.status(500).send({error:error.message})
    }
}
async function updateCarousel(req,res){

    try {
        const carousel=await CarouselService.updateCarousel(req.body);

        return res.status(200).send({carousel})

    } catch (error) {
        return res.status(500).send({error:error.message})
    }
}
module.exports={createCarousel,getCarousel,deleteCarousel,updateCarousel};