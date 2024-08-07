const carService = require("../service/advertismentServices");

async function getAdvertismentById(req, res) {
  const { id } = req.body;
  console.log("Get advertisement by ID:", id);
  try {
    const advertisement = await carService.getAdvertismentById(id);
    if (!advertisement) {
      return res.status(404).json({ message: "Advertisement not found" });
    }
    res.status(200).json(advertisement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getAll(req, res) {
  const { page, size, filter, sortFilter } = req.query;

  try {
    const parsedFilter = filter ? JSON.parse(filter) : {};
    const parsedSortFilter = sortFilter ? JSON.parse(sortFilter) : {};

    console.log("Page:", page);

    const result = await carService.getAllCars(
      page,
      size,
      parsedFilter,
      parsedSortFilter
    );
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      message: "Failed to retrieve data",
      error: error.message,
    });
  }
}

const getBrands = async (req, res) => {
  const { page, size } = req.query;
  try {
    const brandData = await carService.getBrands(page, size);
    res.status(200).json(brandData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getModels = async (req, res) => {
  const { page, size, filter } = req.query;
  try {
    const parsedFilter = filter ? JSON.parse(filter) : {}; // Parse the filter if it exists
    const modelData = await carService.getModels(page, size, parsedFilter);

    res.status(200).json(modelData);
  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getFloatingData = async (req, res) => {
  const { brand, model, year } = req.query;
  try {
    const floatingData = await carService.getFloatingData(brand, model, year);
    console.log("Floating Data", floatingData);
    res.status(200).json(floatingData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMarketData = async (req, res) => {
  const { filter } = req.query;

  try {
    const parsedFilter = filter ? JSON.parse(filter) : {};
    const marketData = await carService.getMarketData(parsedFilter);

    res.status(200).json(marketData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAll,
  getBrands,
  getModels,
  getFloatingData,
  getMarketData,
  getAdvertismentById,
};
