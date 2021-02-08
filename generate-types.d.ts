import { ResolveConfigOptions } from 'prettier';
declare type ArrayType = {
    type: 'array';
    of: Array<{
        type: string;
    }>;
};
declare type BlockType = {
    type: 'block';
};
declare type BooleanType = {
    type: 'boolean';
};
declare type DateType = {
    type: 'date';
};
declare type DatetimeType = {
    type: 'datetime';
};
declare type DocumentType = {
    type: 'document';
    fields: Field[];
    name: string;
    title?: string;
    description?: string;
};
declare type FileType = {
    type: 'file';
    name?: string;
    fields?: any[];
};
declare type GeopointType = {
    type: 'geopoint';
};
declare type ImageType = {
    type: 'image';
    name?: string;
    fields?: any[];
};
declare type NumberType = {
    type: 'number';
};
declare type ObjectType = {
    type: 'object';
    fields: Field[];
    name?: string;
    title?: string;
    description?: string;
};
declare type ReferenceType = {
    type: 'reference';
    to: {
        type: string;
    } | Array<{
        type: string;
    }>;
    weak?: boolean;
};
declare type SlugType = {
    name?: string;
    type: 'slug';
};
declare type StringType = {
    type: 'string';
    options?: {
        list?: Array<string | {
            title: string;
            value: string;
        }>;
    };
};
declare type SpanType = {
    type: 'span';
};
declare type TextType = {
    type: 'text';
    rows?: number;
};
declare type UrlType = {
    type: 'url';
};
declare type IntrinsicType = ArrayType | BlockType | BooleanType | DateType | DatetimeType | DocumentType | FileType | GeopointType | ImageType | NumberType | ObjectType | ReferenceType | SlugType | StringType | SpanType | TextType | UrlType;
declare type Field = {
    name: string;
    title?: string;
    type: string;
    description?: string;
    codegen?: {
        required?: boolean;
    };
    validation?: any;
};
export interface GenerateTypesOptions {
    /**
     * Provide an array of uncompiled sanity types prior to running them through
     * sanity's `createSchema`
     */
    types: IntrinsicType[];
    /**
     * Optionally provide a function that generates the typescript type identifer
     * from the sanity type name. Use this function to override the default and
     * prevent naming collisions.
     */
    generateTypeName?: (sanityTypeName: string) => string;
    /**
     * This option is fed directly to prettier `resolveConfig`
     *
     * https://prettier.io/docs/en/api.html#prettierresolveconfigfilepath--options
     */
    prettierResolveConfigPath?: string;
    /**
     * This options is also fed directly to prettier `resolveConfig`
     *
     * https://prettier.io/docs/en/api.html#prettierresolveconfigfilepath--options
     */
    prettierResolveConfigOptions?: ResolveConfigOptions;
}
declare function generateTypes({ types, generateTypeName, prettierResolveConfigPath, prettierResolveConfigOptions, }: GenerateTypesOptions): Promise<string>;
export default generateTypes;
