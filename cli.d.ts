export declare const defaultBabelOptions: {
    extensions: string[];
    babelrc: boolean;
    configFile: boolean;
    compact: boolean;
    presets: (string | (string | {
        targets: {
            node: boolean;
        };
    })[])[];
    plugins: (string | (string | {
        root: string[];
        alias: {
            'part:@sanity/base/schema-creator': string;
            'all:part:@sanity/base/schema-type': string;
            'part:@sanity/base/schema-type': string;
            '^part:.*': string;
            '^config:.*': string;
            '^all:part:.*': string;
        };
    })[])[];
};
