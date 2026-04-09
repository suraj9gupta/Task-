export const sendResponse = (res, data, meta = {}, status = 200) => {
  res.status(status).json({
    success: status < 400,
    data,
    meta,
  });
};

export const sendError = (res, message, status = 500, meta = {}) => {
  res.status(status).json({
    success: false,
    error: {
      message,
      status,
    },
    meta,
  });
};
