#!/usr/bin/env node
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultBabelOptions = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _generateTypes = _interopRequireDefault(require("./generate-types"));

var _register = _interopRequireWildcard(require("@babel/register"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const defaultBabelOptions = {
  extensions: ['.js', '.ts', '.tsx', '.mjs'],
  // these disable any babel config files in the project so we can run our
  // very specific babel config for the CLI
  babelrc: false,
  configFile: false,
  // disables the warning "Babel has de-optimized the styling of..."
  compact: true,
  presets: [['@babel/preset-env', {
    targets: {
      node: true
    }
  }], '@babel/preset-typescript', '@babel/preset-react'],
  plugins: [// used to resolve and no-op sanity's part system
  ['module-resolver', {
    root: ['.'],
    alias: {
      'part:@sanity/base/schema-creator': 'sanity-codegen/schema-creator-shim',
      'all:part:@sanity/base/schema-type': 'sanity-codegen/schema-type-shim',
      'part:@sanity/base/schema-type': 'sanity-codegen/schema-type-shim',
      '^part:.*': 'sanity-codegen/no-op',
      '^config:.*': 'sanity-codegen/no-op',
      '^all:part:.*': 'sanity-codegen/no-op'
    }
  }], // used to resolve css module imports that are allowed in sanity projects
  'css-modules-transform', '@babel/plugin-proposal-class-properties', '@babel/plugin-proposal-numeric-separator', '@babel/plugin-proposal-optional-chaining', '@babel/plugin-proposal-nullish-coalescing-operator']
};
exports.defaultBabelOptions = defaultBabelOptions;
(0, _register.default)(defaultBabelOptions);

async function cli() {
  // this required needs to come after register
  const resolveConfig = require('./resolve-config').default;

  const configPath = await resolveConfig();

  if (!configPath) {
    throw new Error('Could not find a sanity-codegen.config.ts or sanity-codegen.config.js file.');
  }

  const config = require(configPath).default || require(configPath); // revert and re-register with new babel options from the config


  (0, _register.revert)();
  (0, _register.default)({ ...defaultBabelOptions,
    ...config.babelOptions
  });

  if (!config.schemaPath) {
    throw new Error(`Sanity Codegen config found at "${configPath}" was missing the required option "schemaPath"`);
  }

  if (!config.outputPath) {
    throw new Error(`Sanity Codegen config found at "${configPath}" was missing the required option "outputPath"`);
  }

  const types = require(_path.default.resolve(config.schemaPath)).default || require(_path.default.resolve(config.schemaPath));

  const result = await (0, _generateTypes.default)({
    types,
    ...config
  });

  const outputPath = _path.default.resolve(config.outputPath || './schema.ts');

  await _fs.default.promises.writeFile(outputPath, result);
  console.info(`[SanityCodeGen]: types written out to ${outputPath})`);
}

cli().catch(e => {
  console.error(e);
  process.exit(1);
});