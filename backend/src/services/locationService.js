import { prisma } from '../config/prisma.js';

export const getStates = () => prisma.state.findMany({ orderBy: { name: 'asc' } });

export const getDistrictsByState = (stateId) =>
  prisma.district.findMany({ where: { stateId: Number(stateId) }, orderBy: { name: 'asc' } });

export const getSubDistrictsByDistrict = (districtId) =>
  prisma.subDistrict.findMany({ where: { districtId: Number(districtId) }, orderBy: { name: 'asc' } });

export const getVillagesBySubDistrict = (subDistrictId, { skip, limit }) =>
  prisma.village.findMany({
    where: { subDistrictId: Number(subDistrictId) },
    orderBy: { name: 'asc' },
    skip,
    take: limit,
  });

export const countVillagesBySubDistrict = (subDistrictId) =>
  prisma.village.count({ where: { subDistrictId: Number(subDistrictId) } });

export const searchVillages = (q, { skip, limit }) =>
  prisma.village.findMany({
    where: {
      normalized: {
        contains: q.toLowerCase(),
      },
    },
    include: {
      state: true,
      district: true,
      subDistrict: true,
    },
    orderBy: { name: 'asc' },
    skip,
    take: limit,
  });

export const autocompleteVillages = (q) =>
  prisma.village.findMany({
    where: {
      normalized: {
        startsWith: q.toLowerCase(),
      },
    },
    include: { state: true, district: true, subDistrict: true },
    take: 10,
    orderBy: { name: 'asc' },
  });
