const getPagination = (page, size) => {
  const limit = size ? +size : null;
  const offset = page ? (page == 1 ? 0 : (page - 1) * limit) : 0;

  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalCars, rows: advertisments } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalCars / limit);

  return { totalCars, advertisments, totalPages, currentPage };
};

module.exports = {
  getPagination,
  getPagingData,
};
