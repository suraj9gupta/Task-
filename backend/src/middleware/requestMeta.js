export const requestMeta = (req, res, next) => {
  req.startTime = process.hrtime.bigint();
  res.on('finish', () => {
    const durationMs = Number((process.hrtime.bigint() - req.startTime) / 1000000n);
    req.durationMs = durationMs;
  });
  next();
};
