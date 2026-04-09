import {
  autocompleteVillages,
  countVillagesBySubDistrict,
  getDistrictsByState,
  getStates,
  getSubDistrictsByDistrict,
  getVillagesBySubDistrict,
  searchVillages,
} from '../services/locationService.js';
import { writeApiLog } from '../services/logService.js';
import { getPagination } from '../utils/pagination.js';
import { sendResponse } from '../utils/response.js';

const meta = (req, extra = {}) => ({
  responseTime: `${Number((process.hrtime.bigint() - req.startTime) / 1000000n)}ms`,
  rateLimit: req.rateLimit || null,
  ...extra,
});

export const listStates = async (req, res) => {
  const data = await getStates();
  await writeApiLog({ req, statusCode: 200 });
  return sendResponse(res, data, meta(req));
};

export const listDistricts = async (req, res) => {
  const data = await getDistrictsByState(req.params.id);
  await writeApiLog({ req, statusCode: 200 });
  return sendResponse(res, data, meta(req));
};

export const listSubDistricts = async (req, res) => {
  const data = await getSubDistrictsByDistrict(req.params.id);
  await writeApiLog({ req, statusCode: 200 });
  return sendResponse(res, data, meta(req));
};

export const listVillages = async (req, res) => {
  const pagination = getPagination(req.query);
  const [data, total] = await Promise.all([
    getVillagesBySubDistrict(req.params.id, pagination),
    countVillagesBySubDistrict(req.params.id),
  ]);
  await writeApiLog({ req, statusCode: 200 });
  return sendResponse(res, data, meta(req, { pagination: { ...pagination, total } }));
};

export const search = async (req, res) => {
  const q = req.query.q?.trim();
  const pagination = getPagination(req.query);
  const data = q ? await searchVillages(q, pagination) : [];
  await writeApiLog({ req, statusCode: 200, villageId: data[0]?.id || null });
  return sendResponse(res, data, meta(req, { count: data.length }));
};

export const autocomplete = async (req, res) => {
  const q = req.query.q?.trim();
  const data = q ? await autocompleteVillages(q) : [];
  await writeApiLog({ req, statusCode: 200, villageId: data[0]?.id || null });
  return sendResponse(res, data, meta(req, { count: data.length }));
};
