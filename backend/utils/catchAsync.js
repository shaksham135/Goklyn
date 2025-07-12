/**
 * Wraps an async function to catch any errors and pass them to the next middleware
 * @param {Function} fn - The async function to wrap
 * @returns {Function} - A new function that handles errors
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
