import { SanityReference, SanityKeyedReference } from '../types';
interface CreateClientOptions {
    projectId: string;
    dataset: string;
    fetch: WindowOrWorkerGlobalScope['fetch'];
    token?: string;
    previewMode?: boolean;
    disabledCache?: boolean;
    useCdn?: boolean;
}
declare function createClient<Documents extends {
    _type: string;
    _id: string;
}>({ dataset, projectId, token, previewMode: _previewMode, fetch, disabledCache, useCdn, }: CreateClientOptions): {
    get: <T extends Documents["_type"]>(_type: T, id: string) => Promise<Documents & {
        _type: T;
    }>;
    getAll: <T_1 extends Documents["_type"]>(type: T_1, filterClause?: string | undefined) => Promise<({
        _type: T_1;
    } & Documents)[]>;
    expand: <T_2 extends Documents>(ref: SanityReference<T_2> | SanityKeyedReference<T_2>) => Promise<NonNullable<Documents & {
        _type: T_2["_type"];
    }>>;
    query: <T_3 extends {
        _id: string;
    } = any>(query: string) => Promise<T_3[]>;
    clearCache: () => void;
    setPreviewMode: (previewMode: boolean) => void;
};
export default createClient;
