const { serve } = require("swagger-ui-express");
const Carousel = require("../models/carousel.model.js");



// Create a new cart for a user
async function createCarousel(carousel) {
    let search = []
    if (carousel?.path) {
        search.push({ path: carousel.path })
    }
    if (carousel?.image) {
        search.push({ image: carousel.image })
    }
    const carouselExist = await Carousel.findOne({ $and: search })
    if (carouselExist) {
        return {
            success: false,
            message: "Carousel Already Exist"
        }
    }
    const Carousels = await new Carousel(Object.assign(...search));
    const createdCarousel = await Carousels.save();
    return {
        success:true,
        message:"Carousel created successfuly",
        createdCarousel
    };
}
async function getCarousel(query) {
    let search = [{isDeleted:false},{isActive:true}]
    var pageNumber = 1;
    var pageSize = 0;
    if (query?.pageNumber && Number(query.pageNumber)) {
      pageNumber = Number(query.pageNumber);
    }
    if (query?.pageSize && Number(query.pageSize)) {
      pageSize = Number(query.pageSize);
    }
    if (query._id) {
        search.push(
            { parentCarousel: query._id }
        )
    }
    const CarouselsCount = await Carousel
    .find({ $and: search })
    .countDocuments();
  var numberOfPages = pageSize === 0 ? 1 : Math.ceil(CarouselsCount / pageSize);
  const Carousellist =await Carousel.aggregate([
    { $match: { $and: search } },
    { $sort: { createdAt: -1 } },
    { $skip: (pageNumber - 1) * pageSize },
    { $limit: pageSize ? pageSize : Number.MAX_SAFE_INTEGER },
  ]);
    return {
        success:true,
        message:"Carousel list",
        Carousellist,
        numberOfPages,
        CarouselsCount
    };
}
async function deleteCarousel(body){
    const updated= await Carousels.findByIdAndUpdate(body?._id,{$set:{isDeleted:body?.isDeleted}},{new:true})
    return{
        success:true,
        message:"Carousel Deleted successfully",
        updated
    }
}
async function updateCarousel(body){
    const updated= await Carousels.findByIdAndUpdate(body?._id,{$set:{...body}},{new:true})
    return{
        success:true,
        message:"Carousel Updated successfully",
        updated
    }
}
module.exports = { getCarousel, createCarousel,deleteCarousel,updateCarousel };
