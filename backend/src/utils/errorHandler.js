/**
 * Send a sanitized error response. Logs the full error server-side always,
 * but only echoes error.message to the client outside production — Prisma
 * error messages can include column/constraint names and other internals.
 */
export const handleError = (res, error, status = 500) => {
  console.error(error);
  const message = process.env.NODE_ENV === 'production'
    ? 'Something went wrong. Please try again later.'
    : error.message;
  res.status(status).json({ message });
};
