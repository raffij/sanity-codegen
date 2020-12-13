import { SanityReference } from '../types';

interface CreateClientOptions {
  projectId: string;
  dataset: string;
  fetch: WindowOrWorkerGlobalScope['fetch'];
  token?: string;
  previewMode?: boolean;
}

interface SanityResult<T> {
  ms: number;
  query: string;
  result: T[];
}

type Id = { id: string };
type Projection<T, R extends keyof T> = { select?: Array<R> };
type Filter = { where?: string };

function createClient<Documents extends { _type: string; _id: string }>({
  dataset,
  projectId,
  token,
  previewMode = false,
  fetch,
}: CreateClientOptions) {
  /**
   * narrows in on the type of the document by using a union
   */
  type SanityDoc<T extends string> = Documents & { _type: T };

  async function jsonFetch<T>(url: RequestInfo, options?: RequestInit) {
    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...options?.headers,
      },
    });
    return (await response.json()) as T;
  }

  /**
   * Given a type string and a document ID, this function returns a typed
   * version of that document.
   *
   * If previewMode is true and a token is provided, then the client will prefer
   * drafts over the published version.
   */
  // NOTE: order of these overloads are important
  async function get<T extends Documents['_type']>(
    _type: T,
    options: Id
  ): Promise<SanityDoc<T> | null>;

  async function get<
    T extends Documents['_type'],
    R extends keyof SanityDoc<T>
  >(
    _type: T,
    options: Id & Projection<SanityDoc<T>, R>
  ): Promise<Pick<SanityDoc<T>, R> | null>;

  async function get<T extends Documents['_type']>(
    _type: T,
    id: string
  ): Promise<SanityDoc<T> | null>;

  async function get<T extends Documents['_type']>(
    // NOTE: type is exclusively for typescript, it's not actually used in code
    _type: T,
    arg: string | (Id & Projection<SanityDoc<T>, any>)
  ): Promise<SanityDoc<T> | null> {
    const searchParams = new URLSearchParams();
    const preview = previewMode && !!token;
    const id = typeof arg === 'object' ? arg.id : arg;
    const selection = typeof arg === 'object' ? arg.select || [] : [];

    const previewClause = preview
      ? // sanity creates a new document with an _id prefix of `drafts.`
        // for when a document is edited without being published
        `|| _id=="drafts.${id}"`
      : '';
    const projectionClause = selection.length
      ? ` { ${selection.join(', ')} }`
      : '';

    searchParams.set(
      'query',
      `* [_id == "${id}" ${previewClause}]${projectionClause}`
    );
    const response = await jsonFetch<SanityResult<SanityDoc<T>>>(
      `https://${projectId}.api.sanity.io/v1/data/query/${dataset}?${searchParams.toString()}`,
      {
        // conditionally add the authorization header if the token is present
        ...(token && { headers: { Authorization: `Bearer ${token}` } }),
      }
    );

    // this will always be undefined in non-preview mode
    const previewDoc = response.result.find((doc) =>
      doc._id.startsWith('drafts.')
    );

    const publishedDoc = response.result.find(
      (doc) => !doc._id.startsWith('drafts.')
    );

    return previewDoc || publishedDoc || null;
  }

  /**
   * Gets all the documents of a particular type. In preview mode, if a document
   * has a draft, that will be returned instead.
   */
  // NOTE: order of these overloads are important
  async function getAll<T extends Documents['_type']>(
    type: T,
    options?: Filter
  ): Promise<Array<SanityDoc<T>>>;

  async function getAll<
    T extends Documents['_type'],
    R extends keyof SanityDoc<T>
  >(
    type: T,
    options?: Filter & Projection<SanityDoc<T>, R>
  ): Promise<Array<Pick<SanityDoc<T>, R>>>;

  async function getAll<T extends Documents['_type']>(
    type: T,
    filterClause?: string
  ): Promise<Array<SanityDoc<T>>>;

  async function getAll<T extends Documents['_type']>(
    type: T,
    arg?: string | (Filter & Projection<SanityDoc<T>, any>)
  ): Promise<Array<SanityDoc<T>>> {
    const searchParams = new URLSearchParams();
    const preview = previewMode && !!token;
    const filter = typeof arg === 'object' ? arg.where : arg;
    const selection = typeof arg === 'object' ? arg.select || [] : [];

    const filterClause = filter ? ` && ${filter}` : '';
    const projectionClause = selection.length
      ? ` { ${selection.join(', ')} }`
      : '';

    searchParams.set(
      'query',
      `* [_type == "${type}"${filterClause}]${projectionClause}`
    );
    const response = await jsonFetch<SanityResult<SanityDoc<T>>>(
      `https://${projectId}.api.sanity.io/v1/data/query/${dataset}?${searchParams.toString()}`,
      {
        // conditionally add the authorization header if the token is present
        ...(token && { headers: { Authorization: `Bearer ${token}` } }),
      }
    );

    const prefix = 'drafts.';

    if (!preview) {
      return response.result.filter((doc) => !doc._id.startsWith(prefix));
    }

    const removeDraftPrefix = (_id: string) =>
      _id.startsWith(prefix) ? _id.substring(prefix.length) : _id;

    // create a lookup of only draft docs
    const draftDocs = response.result
      .filter((doc) => doc._id.startsWith('drafts.'))
      .reduce<{ [_id: string]: SanityDoc<T> }>((acc, next) => {
        acc[removeDraftPrefix(next._id)] = next;
        return acc;
      }, {});

    // in this dictionary, if there is draft doc, that will be preferred,
    // otherwise it'll use the published version
    const finalAcc = response.result.reduce<{ [_id: string]: SanityDoc<T> }>(
      (acc, next) => {
        const id = removeDraftPrefix(next._id);
        acc[id] = draftDocs[id] || next;
        return acc;
      },
      {}
    );

    return Object.values(finalAcc);
  }

  /**
   * If a sanity document refers to another sanity document, then you can use this
   * function to expand that document, preserving the type
   */
  async function expand<T extends Documents, R extends keyof T>(
    ref: SanityReference<T>,
    options?: Projection<T, R>
  ): Promise<Pick<T, R>>;

  async function expand<T extends Documents>(
    ref: SanityReference<T>
  ): Promise<T>;

  async function expand<T extends Documents>(
    ref: SanityReference<T>,
    arg?: Projection<T, any>
  ): Promise<T> {
    // this function is primarily for typescript
    const response = await get<T['_type']>(null as any, {
      id: ref._ref,
      ...arg,
    });
    // since this is a ref, the response will be defined (unless weak reference)
    return (response as T)!;
  }

  return { get, getAll, expand };
}

export default createClient;
