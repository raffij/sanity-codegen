"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// The purpose of this file is to shim out the `createSchema` call from
// `import createSchema from 'part:@sanity/base/schema-creator';`
// so that it simply re-exports the uncompiled type
function createSchemaShim({
  types
}) {
  return types;
}

var _default = createSchemaShim;
exports.default = _default;