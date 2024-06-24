const models = require("../models");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const ResponseService = require("../shared/ResponseService");

//Read one by id
const getByid = async (model, id) => {
  try {
    const result = await models.model.findByPk(id);
    if (!result) {
      ResponseService.generalResponse(
        result.error,
        res,
        `${model} Data Not found`,
        404
      );
    }
    ResponseService.generalPayloadResponse(null, res, "Success", 200);
    return result;
  } catch (error) {
    ResponseService.generalResponse(error, res, "Error", "Bad request", 500);
  }
};

//Read all
const getAll = async (model) => {
  try {
    const result = await models.model.findAll();
    if (!result) {
      ResponseService.generalResponse(
        result.error,
        res,
        `${model} Data Not found`,
        404
      );
    }
    ResponseService.generalPayloadResponse(null, res, "Success", 200);
    return result;
  } catch (error) {
    ResponseService.generalResponse(error, res, "Error", "Bad request", 500);
  }
};

//Read with where clause
const getByQuery = async (model, query) => {
  try {
    const result = await models.model.findAll({
      where: query,
    });
    if (!result) {
      ResponseService.generalResponse(
        result.error,
        res,
        `${model} Data Not found`,
        404
      );
    }
    ResponseService.generalPayloadResponse(null, res, "Success", 200);
    return result;
  } catch (error) {
    ResponseService.generalResponse(error, res, "Error", "Bad request", 500);
  }
};

//pagination

const getPagination = (page, size) => {
  const limit = size ? +size : null;
  const offset = page ? (page == 1 ? 0 : (page - 1) * limit) : 0;

  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalAdvertisments, rows: advertisments } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalAdvertisments / limit);

  return { totalAdvertisments, advertisments, totalPages, currentPage };
};

//Get by pagination
const getByPagination = async (model, page, size) => {
  try {
    const { limit, offset } = getPagination(page, size);

    const result = await models.model.findAndCountAll({
      limit: limit,
      offset: offset,
    });
    if (!result) {
      ResponseService.generalResponse(
        result.error,
        res,
        `${model} Data Not found`,
        404
      );
    }
    const response = getPagingData(result, page, limit);

    ResponseService.generalPayloadResponse(null, res, "Success", 200);
    return response;
  } catch (error) {
    ResponseService.generalResponse(error, res, "Error", "Bad request", 500);
  }
};
