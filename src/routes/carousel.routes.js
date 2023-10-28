const express=require("express");
const router=express.Router();
const CarouselController=require("../controllers/carousel.controller")


router.post("/createCarousel",CarouselController.createCarousel)
router.get("/getCarousel",CarouselController.getCarousel)
router.post("/deleteCarousel",CarouselController.deleteCarousel)
router.post("/updateCarousel",CarouselController.updateCarousel)

module.exports=router;