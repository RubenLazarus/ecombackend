const { serve } = require("swagger-ui-express");
const Categorys = require("../models/category.model");

// Create a new cart for a user
async function createCategory(category) {
  let search = [];
  if (category?.name) {
    search.push({ name: category.name });
  }
  if (category?.level) {
    search.push({ level: category.level });
  }
  if (category?.imageUrl) {
    search.push({ imageUrl: category.imageUrl });
  }
  if (category?.description) {
    search.push({ description: category.description });
  }
  if (category?.parentCategory) {
    search.push({ parentCategory: category.parentCategory });
  }
  const categoryExist = await Categorys.findOne({ $and: search });
  if (categoryExist) {
    return {
      success: false,
      message: "category Already Exist",
    };
  }
  const Category = await new Categorys(Object.assign(...search));
  const createdCategory = await Category.save();
  return {
    success: true,
    message: "Category created successfuly",
    createdCategory,
  };
}
async function getAllCategory(query) {
  let search = [{ isDeleted: false }, { isActive: true }];
  var pageNumber = 1;
  var pageSize = 0;
  if (query?.pageNumber && Number(query.pageNumber)) {
    pageNumber = Number(query.pageNumber);
  }
  if (query?.pageSize && Number(query.pageSize)) {
    pageSize = Number(query.pageSize);
  }
  if (query.level && Number(query.level)) {
    search.push({ level: Number(query.level) });
  }
  if (query.parentCategory) {
    search.push({ parentCategory: query.parentCategory });
  }
  if (query._id) {
    search.push({ _id: query._id });
  }
  if(query.searchTerm){
    search.push({
      $or:[ { 'name': { $regex: query.searchTerm, $options: 'i' } },]
    })
  }
  const CategorysCount = await Categorys.find({
    $and: search,
  }).countDocuments();
  var numberOfPages = pageSize === 0 ? 1 : Math.ceil(CategorysCount / pageSize);
  const Categorylist = await Categorys.aggregate([
    { $match: { $and: search } },
    { $sort: { createdAt: -1 } },
    { $skip: (pageNumber - 1) * pageSize },
    { $limit: pageSize ? pageSize : Number.MAX_SAFE_INTEGER },
  ]);
  return {
    success: true,
    message: "category list",
    Categorylist,
    numberOfPages,
    CategorysCount,
  };
}
async function deleteCategory(body) {
  const findData = await Categorys.findById(body?._id).lean();
  if (!findData) {
    return {
      success: false,
      message: "Unable to find Category",
    };
  }
  let update;
  if (findData?.level) {
    if (findData?.level == 1) {
      update = await Categorys.updateMany(
        { $or: [{ parentCategory: body?._id }, { _id: body?._id }] },
        { $set: { isDeleted: body?.isDeleted } }
      );
      const nextLevel = await Categorys.find({ parentCategory: body?._id });
      if (nextLevel && nextLevel.length > 0) {
        for await (const level2 of nextLevel) {
          const updateNext = await Categorys.updateMany(
            { parentCategory: level2.parentCategory },
            { $set: { isDeleted: body?.isDeleted } }
          );
        }
      }
    }
    if ((findData?.level == 2)) {
      update = await Categorys.updateMany(
        { $or: [{ parentCategory: body?._id }, { _id: body?._id }] },
        { $set: { isDeleted: body?.isDeleted } }
      );
    }
    if ((findData?.level == 3)) {
      update = await Categorys.findByIdAndUpdate(
        body?._id,
        { $set: { isDeleted: body?.isDeleted } },
        { new: true }
      ).lean();
    }
  }
  return {
    success: true,
    message: "Category Deleted successfully",
    update,
  };
}
async function updateCategory(body) {
  const updated = await Categorys.findByIdAndUpdate(
    body?._id,
    { $set: { ...body } },
    { new: true }
  );

  return {
    success: true,
    message: "Category Updated successfully",
    updated,
  };
}

module.exports = {
  getAllCategory,
  createCategory,
  deleteCategory,
  updateCategory,
};
