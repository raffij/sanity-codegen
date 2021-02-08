"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Note: @babel/register must be hooked prior to this file running because this
// resolving method uses `require.resolve`.
async function resolveConfig() {
  // this path can either be the direct path to the config or a path to a
  // directory. If it's a directory we'll walk up the file system checking for
  // `sanity-codegen.config.js` or `sanity-codegen.config.ts`
  const configContextPath = process.argv[2] || process.cwd(); // if direct path then return it

  if (_fs.default.existsSync(configContextPath)) {
    const stat = await _fs.default.promises.stat(configContextPath);

    if (!stat.isDirectory()) {
      return configContextPath;
    }
  } // otherwise walk up the tree


  async function findConfig(configPath) {
    try {
      return require.resolve(`${configPath}/sanity-codegen.config`);
    } catch {
      const currentFolder = _path.default.resolve('./', configPath);

      const parentFolder = _path.default.resolve('../', configPath);

      if (currentFolder === parentFolder) {
        return null;
      }

      return await findConfig(parentFolder);
    }
  }

  return await findConfig(configContextPath);
}

var _default = resolveConfig;
exports.default = _default;