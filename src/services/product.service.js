const Category = require("../models/category.model");
const Product = require("../models/product.model");
var mongoose = require('mongoose');
// Create a new product
async function createProduct(reqData) {
  let topLevel = await Category.findOne({
    _id: reqData.parentCategory,
    isActive: true,
    isDeleted: false,
  }).lean();

  if (!topLevel) {
    return {
      success: false,
      message: "Category Not Found",
    };
  }

  let secondLevel = await Category.findOne({
    _id: reqData.category,
    parentCategory: topLevel._id,
    isActive: true,
    isDeleted: false,
  }).lean();

  if (!secondLevel) {
    return {
      success: false,
      message: "Sub-Category Not Found / Not related to the category",
    };
  }

  const product = new Product({
    title: reqData.title,
    color: reqData.color,
    description: reqData.description,
    discountedPrice: reqData.discountedPrice,
    discountPersent: reqData.discountPersent,
    imageUrl: reqData.imageUrl,
    brand: reqData.brand,
    price: reqData.price,
    size: reqData.size,
    parentCategory: topLevel._id,
    pricePerKG: reqData.pricePerKG,
    quantity: reqData.quantity,
    category: secondLevel._id,
    parentCategory: topLevel._id,
  });

  const savedProduct = await product.save();

  return {
    success: true,
    message: "Product created successfully",
    savedProduct
  };
}
// Delete a product by ID
async function deleteProduct(productId) {
  const product = await findProductById(productId);

  if (!product) {
    throw new Error("product not found with id - : ", productId);
  }

  await Product.findByIdAndDelete(productId);

  return "Product deleted Successfully";
}

// Update a product by ID
async function updateProduct(productId, reqData) {
  // const getProductById = await Product.findById(productId).lean()
  const updatedProduct = await Product.findByIdAndUpdate(productId, reqData?.data, { new: true });
  return updatedProduct;
}

// Find a product by ID
async function findProductById(id) {
  const product = await Product.findById(id).populate("category").exec();

  if (!product) {
    throw new Error("Product not found with id " + id);
  }
  return product;
}

// Get all products with filtering and pagination
async function getAllProducts(reqQuery) {
  let {
    category,
    parentCategory,
    size,
    minPrice,
    maxPrice,
    minDiscount,
    sort,
    stock,
    pageNumber,
    pageSize,
    searchTerm
  } = reqQuery;
  (pageSize = Number(pageSize) || 10), (pageNumber = Number(pageNumber) || 1);
  let search = [{ isActive: true }, { isDeleted: false }]
  let sorting = { }

  if (searchTerm) {
    search.push({
      $or: [
        { 'title': { $regex:searchTerm, $options: 'i' } },
        { 'category.name': { $regex:searchTerm, $options: 'i' } },
        { 'parentCategory.name': { $regex:searchTerm, $options: 'i' } },
      ],
    })
  }

  if (size) {
    search.push({ size: size })

  }
  if (category) {
    let temp =new mongoose.Types.ObjectId(category)
    search.push({ category: temp })

  }
  if (parentCategory) {
    let temp =new mongoose.Types.ObjectId(parentCategory)
    search.push({ parentCategory: temp })

  }

  if (minPrice && maxPrice) {
    search.push({ discountedPrice: { "$gte": Number(minPrice), "$lte": Number(maxPrice) } })
  }

  if (minDiscount) {
    search.push({ discountPersent: { "$gt": Number(minDiscount) } })
  }

  if (stock) {
    if (stock === "in_stock") {
      search.push({ quantity: { "$gt": 0 } })
    } else if (stock === "out_of_stock") {
      search.push({ quantity: { "$lte": 0 } })
    }
  }

  if (sort) {
    const sortDirection = sort === "price_high" ? -1 : 1;
    sorting.discountedPrice=sortDirection 

  }else{
    sorting.createdAt=-1
  }
  const Productslist = await Product.aggregate([

    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryData',
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'parentCategory',
        foreignField: '_id',
        as: 'parentCategoryData',
      }
    },
    {
      $unwind: {
        path: '$categoryData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$parentCategoryData',
        preserveNullAndEmptyArrays: true,
      },
    },
    { $match: { $and: search } },
    { $sort: sorting },
    { $skip: (pageNumber - 1) * pageSize },
    { $limit: pageSize ? pageSize : Number.MAX_SAFE_INTEGER },
  ]);
  const Productslist2 = await Product.aggregate([

    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category',
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'parentCategory',
        foreignField: '_id',
        as: 'parentCategory',
      }
    },
    {
      $unwind: {
        path: '$category',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$parentCategory',
        preserveNullAndEmptyArrays: true,
      },
    },
    { $match: { $and: search } },
    { $sort: sorting },
  ]);
  const totalProductsCounts = Productslist2.length
  var totalPages = pageSize === 0 ? 1 : Math.ceil(totalProductsCounts / pageSize);

  // Apply pagination


  return { content: Productslist, currentPage: pageNumber, totalPages: totalPages,totalProductsCounts };
}

async function createMultipleProduct(products) {
  for (let product of products) {
    await createProduct(product);
  }
}
module.exports = {
  createProduct,
  deleteProduct,
  updateProduct,
  getAllProducts,
  findProductById,
};
