import { Router } from 'express';
import {
  autocomplete,
  listDistricts,
  listStates,
  listSubDistricts,
  listVillages,
  search,
} from '../controllers/locationController.js';
import { withCache } from '../middleware/cache.js';

const router = Router();

router.get('/states', withCache(900), listStates);
router.get('/states/:id/districts', withCache(900), listDistricts);
router.get('/districts/:id/subdistricts', withCache(900), listSubDistricts);
router.get('/subdistricts/:id/villages', withCache(300), listVillages);
router.get('/search', withCache(120), search);
router.get('/autocomplete', withCache(60), autocomplete);

export default router;
