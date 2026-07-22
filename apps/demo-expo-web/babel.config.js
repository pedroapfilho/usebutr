/** @param {{ cache: (enabled: boolean) => void }} api */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
  };
};
