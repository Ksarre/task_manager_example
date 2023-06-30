const convertRaw = async (result) => {
  if (Array.isArray(result)) {
    return result.map((e) => e.get({ plain: true }));
  }
  return result.get({ plain: true });
};

module.exports = { convertRaw };
