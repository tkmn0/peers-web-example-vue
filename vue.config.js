const DEVELOPMEANT_DIST_PATH =
  "../peers-server-example-express-typescript/web_dev";
const PRODUCTION_DIST_PATH = "../peers-server-example-express-typescript/web";
module.exports = {
  transpileDependencies: ["vuetify"],
  outputDir:
    process.env.NODE_ENV === "development"
      ? DEVELOPMEANT_DIST_PATH
      : PRODUCTION_DIST_PATH
};
