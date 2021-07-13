const BusObject = require("../../models/bus");

async function getBusesHelper() {
  return await BusObject.find({});
}

async function getBusByIdHelper(id) {
  return await BusObject.findOne({ _id: id });
}

async function deleteBusByIdHelper(id) {
  const Bus = await getBusByIdHelper(id);
  await Bus.remove();
}

async function deleteAllBusesHelper() {
  await BusObject.deleteMany({});
}

async function createBusHelper(Bus) {
  return await BusObject.create(Bus);
}

module.exports = {
  getBusesHelper,
  getBusByIdHelper,
  deleteBusByIdHelper,
  createBusHelper,
  deleteAllBusesHelper,
};
