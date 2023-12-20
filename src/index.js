require('dotenv').config()
const express = require("express")
const cors = require('cors');

const app = express();

app.use(express.json())
const multer = require("multer") 
app.use(cors())

app.get("/", (req, res) => {
    return res.status(200).send({ message: "welcome to ecommerce api - node" })
})

const authRouter = require("./routes/auth.routes.js")
app.use("/auth", authRouter)

const userRouter = require("./routes/user.routes.js");
app.use("/api/users", userRouter)

const productRouter = require("./routes/product.routes.js");
app.use("/api/products", productRouter);

const adminProductRouter = require("./routes/product.admin.routes.js");
app.use("/api/admin/products", adminProductRouter);

const cartRouter = require("./routes/cart.routes.js")
app.use("/api/cart", cartRouter);

const cartItemRouter = require("./routes/cartItem.routes.js")
app.use("/api/cart_items", cartItemRouter);

const orderRouter = require("./routes/order.routes.js");
app.use("/api/orders", orderRouter);

const paymentRouter = require("./routes/payment.routes.js");
app.use('/api/payments', paymentRouter)

const reviewRouter = require("./routes/review.routes.js");
app.use("/api/reviews", reviewRouter);

const ratingRouter = require("./routes/rating.routes.js");
app.use("/api/ratings", ratingRouter);

const categoryRouter = require("./routes/category.routes.js");
app.use("/api/category", categoryRouter);
const carouselRouter = require("./routes/carousel.routes.js");
app.use("/api/carousel", carouselRouter);
const dashboardRouter = require("./routes/dashboard.routes.js");
app.use("/api/dashboard", dashboardRouter);

// admin routes handler
const adminOrderRoutes = require("./routes/adminOrder.routes.js");
app.use("/api/admin/orders", adminOrderRoutes);
const adminUserRoutes = require("./routes/adminUser.routes.js");
app.use("/api/admin/users", adminUserRoutes);
const adminProfileRoutes = require("./routes/adimProfile.routes.js");
app.use("/api/admin/profile", adminProfileRoutes);

module.exports = { app };