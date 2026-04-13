import { sendError } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  console.error(err);
  return sendError(res, err.message || 'Internal server error', err.status || 500);
};
