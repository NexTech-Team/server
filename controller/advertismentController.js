const carService = require("../service/advertismentServices");

const getBrands = async (req, res) => {
  try {
    const brandData = await carService.getBrands();
    res.status(200).json(brandData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getModels = async (req, res) => {
  try {
    const modelData = await carService.getModels();
    res.status(200).json(modelData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getBrands,
  getModels,
};
