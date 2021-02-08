"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _prettier = require("prettier");

function validatePropertyName(sanityTypeName, parents, params) {
  const regex = params.allowHyphen ? /^[A-Z][A-Z0-9_-]*$/i : /^[A-Z][A-Z0-9_]*$/i;

  if (!regex.test(sanityTypeName)) {
    throw new Error(`Name "${sanityTypeName}" ${parents.length > 0 ? `in type "${parents.join('.')}" ` : ''}is not valid. Ensure camel case, alphanumeric, and underscore characters only`);
  }
}

function defaultGenerateTypeName(sanityTypeName) {
  const typeName = `${sanityTypeName.substring(0, 1).toUpperCase()}${sanityTypeName // If using snake_case, remove underscores and convert to uppercase the letter following them.
  .replace(/(_[A-Z])/gi, replace => replace.substring(1).toUpperCase()).replace(/(-[A-Z])/gi, replace => replace.substring(1).toUpperCase()).substring(1)}`;
  return typeName;
}

async function generateTypes({
  types,
  generateTypeName = defaultGenerateTypeName,
  prettierResolveConfigPath,
  prettierResolveConfigOptions
}) {
  const documentTypes = types.filter(t => t.type === 'document');
  const otherTypes = types.filter(t => t.type !== 'document');
  const createdTypeNames = {};
  const referencedTypeNames = {};

  function createTypeName(sanityTypeName, params) {
    validatePropertyName(sanityTypeName, [], params);
    const typeName = generateTypeName(sanityTypeName);
    createdTypeNames[typeName] = true;
    return typeName;
  }
  /**
   * Given a sanity type name, it returns a normalized name that will be used for
   * typescript interfaces throwing if invalid
   */


  function getTypeName(sanityTypeName, params) {
    validatePropertyName(sanityTypeName, [], params);
    const typeName = generateTypeName(sanityTypeName);
    referencedTypeNames[typeName] = true;
    return typeName;
  }
  /**
   * Converts a sanity type to a typescript type recursively
   */


  function convertType(obj, parents, isArray = false) {
    const intrinsic = obj;

    if (intrinsic.type === 'array') {
      const union = intrinsic.of.map((i, index) => convertType(i, [...parents, index], true)).map(i => {
        // if the wrapping type is a reference, we need to replace that type
        // with `SanityKeyedReference<T>` in order to preserve `T` (which
        // is purely for meta programming purposes)
        const referenceMatch = /^\s*SanityReference<([^>]+)>\s*$/.exec(i);

        if (referenceMatch) {
          const innerType = referenceMatch[1];
          return `SanityKeyedReference<${innerType}>`;
        }

        return `SanityKeyed<${i}>`;
      }).join(' | ');
      return `Array<${union}>`;
    }

    if (intrinsic.type === 'block') {
      return 'SanityBlock';
    }

    if (intrinsic.type === 'document') {
      throw new Error('Found nested document type');
    }

    if (intrinsic.type === 'span') {
      throw new Error('Found span outside of a block type.');
    }

    if (intrinsic.type === 'geopoint') {
      return 'SanityGeoPoint';
    }

    if (intrinsic.type === 'image' || intrinsic.type === 'file') {
      const typeClause = `_type: '${isArray ? intrinsic.name : intrinsic.type}'; `;
      const assetClause = 'asset: SanityAsset;';
      const imageSpecificClause = intrinsic.type === 'image' ? `
        crop?: SanityImageCrop;
        hotspot?: SanityImageHotspot;
      ` : '';
      const fields = (intrinsic === null || intrinsic === void 0 ? void 0 : intrinsic.fields) || [];
      return `{ ${typeClause} ${assetClause} ${imageSpecificClause} ${fields.map(field => convertField(field, [...parents, intrinsic.name || `(anonymous ${intrinsic.type})`])).filter(Boolean).join('\n')} }`;
    }

    if (intrinsic.type === 'object') {
      const typeClause = intrinsic.name ? `_type: '${intrinsic.name}';` : '';
      return `{ ${typeClause} ${intrinsic.fields.map(field => convertField(field, [...parents, intrinsic.name || '(anonymous object)'])).filter(Boolean).join('\n')} }`;
    }

    if (intrinsic.type === 'reference') {
      // TODO for weak references, the expand should return \`T | undefined\`
      const to = Array.isArray(intrinsic.to) ? intrinsic.to : [intrinsic.to];
      const union = to.map(refType => convertType(refType, [...parents, '_ref'])).join(' | '); // Note: we want the union to be wrapped by one Reference<T> so when
      // unwrapped the union can be further discriminated using the `_type`
      // of each individual reference type

      return `SanityReference<${union}>`;
    }

    if (intrinsic.type === 'boolean') {
      return 'boolean';
    }

    if (intrinsic.type === 'date') {
      return 'string';
    }

    if (intrinsic.type === 'datetime') {
      return 'string';
    }

    if (intrinsic.type === 'number') {
      return 'number';
    }

    if (intrinsic.type === 'slug') {
      return `{ _type: '${intrinsic.name || intrinsic.type}'; current: string; }`;
    }

    if (intrinsic.type === 'string') {
      var _intrinsic$options, _intrinsic$options2;

      // Sanity lets you specify a set of list allowed strings in the editor
      // for the type of string. This checks for that and returns unioned
      // literals instead of just `string`
      if ((_intrinsic$options = intrinsic.options) !== null && _intrinsic$options !== void 0 && _intrinsic$options.list && Array.isArray((_intrinsic$options2 = intrinsic.options) === null || _intrinsic$options2 === void 0 ? void 0 : _intrinsic$options2.list)) {
        var _intrinsic$options3;

        return (_intrinsic$options3 = intrinsic.options) === null || _intrinsic$options3 === void 0 ? void 0 : _intrinsic$options3.list.map(item => typeof item === 'object' ? item.value : item).map(item => `'${item}'`).join(' | ');
      } // else just return a string


      return 'string';
    }

    if (intrinsic.type === 'text') {
      return 'string';
    }

    if (intrinsic.type === 'url') {
      return 'string';
    }

    return getTypeName(obj.type, {
      allowHyphen: true
    });
  }

  function convertField(field, parents) {
    var _field$codegen;

    const required = !!((_field$codegen = field.codegen) !== null && _field$codegen !== void 0 && _field$codegen.required);
    const optional = !required ? '?' : '';

    if (required && typeof field.validation !== 'function') {
      throw new Error(`Field "${[...parents, field.name].join('.')}" was marked as required but did not have a validation function.`);
    }

    validatePropertyName(field.name, parents, {
      allowHyphen: false
    });
    return `
      /**
       * ${field.title || field.name} — \`${field.type}\`
       *
       * ${field.description || ''}
       */
      ${field.name}${optional}: ${convertType(field, [...parents, field.name])};
    `;
  }

  function generateTypeForDocument(schemaType) {
    const {
      name,
      title,
      description,
      fields
    } = schemaType;

    if (!name) {
      throw new Error(`Found a document type with no name field.`);
    }

    return `
    /**
     * ${title || name}
     *
     * ${description || ''}
     */
    export interface ${createTypeName(name, {
      allowHyphen: true
    })} extends SanityDocument {
        _type: '${name}';
        ${fields.map(field => convertField(field, [name])).filter(Boolean).join('\n')}
    }
  `;
  }

  const typeStrings = [`
      import type {
        SanityReference,
        SanityKeyedReference,
        SanityAsset,
        SanityImage,
        SanityFile,
        SanityGeoPoint,
        SanityBlock,
        SanityDocument,
        SanityImageCrop,
        SanityImageHotspot,
        SanityKeyed,
      } from 'sanity-codegen';

      export type {
        SanityReference,
        SanityKeyedReference,
        SanityAsset,
        SanityImage,
        SanityFile,
        SanityGeoPoint,
        SanityBlock,
        SanityDocument,
        SanityImageCrop,
        SanityImageHotspot,
        SanityKeyed,
      };
  `, ...types.filter(t => t.type === 'document').map(generateTypeForDocument), ...otherTypes.filter(t => !!t.name).map(type => {
    return `
          export type ${createTypeName(type.name, {
      allowHyphen: false
    })} = ${convertType(type, [])};
        `;
  })];

  if (documentTypes.length) {
    typeStrings.push(`
      export type Documents = ${documentTypes.map(({
      name
    }) => getTypeName(name, {
      allowHyphen: true
    })).join(' | ')}
    `);
  }

  const missingTypes = Object.keys(referencedTypeNames).filter(typeName => !createdTypeNames[typeName]);

  if (missingTypes.length) {
    console.warn(`Could not find types for: ${missingTypes.map(t => `"${t}"`).join(', ')}. Ensure they are present in your schema. ` + `Future versions of sanity-codegen will allow you to type them separately.`);
  }

  for (const missingType of missingTypes) {
    typeStrings.push(`
      /**
       * This interface is a stub. It was referenced in your sanity schema but
       * the definition was not actually found. Future versions of
       * sanity-codegen will let you type this explicity.
       */
      type ${missingType} = any;
    `);
  }

  const resolvedConfig = prettierResolveConfigPath ? await (0, _prettier.resolveConfig)(prettierResolveConfigPath, prettierResolveConfigOptions) : null;
  return (0, _prettier.format)(typeStrings.join('\n'), { ...resolvedConfig,
    parser: 'typescript'
  });
}

var _default = generateTypes;
exports.default = _default;