/**
 * isEmpty helper method
 * @param {string, integer} input
 * @returns {Boolean} True or False
 */
const isEmpty = (input) => {
  if (input === undefined || input === '') {
    return true
  }
  return false
}

module.exports = {
  isEmpty
}
