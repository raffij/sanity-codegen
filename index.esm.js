function createClient({
  dataset,
  projectId,
  token,
  previewMode: _previewMode = false,
  fetch,
  disabledCache,
  useCdn
}) {
  const cache = {};
  const previewModeRef = {
    current: _previewMode
  };

  async function jsonFetch(url, options) {
    const response = await fetch(url, Object.assign({}, options, {
      headers: Object.assign({
        Accept: 'application/json'
      }, options === null || options === void 0 ? void 0 : options.headers)
    }));
    return await response.json();
  }
  /**
   * Given a type string and a document ID, this function returns a typed
   * version of that document.
   *
   * If previewMode is true and a token is provided, then the client will prefer
   * drafts over the published version.
   */


  async function get( // NOTE: type is exclusively for typescript, it's not actually used in code
  _type, id) {
    if (cache[id] && !disabledCache) {
      return cache[id];
    }

    const preview = previewModeRef.current && !!token;
    const previewClause = preview ? // sanity creates a new document with an _id prefix of `drafts.`
    // for when a document is edited without being published
    `|| _id=="drafts.${id}"` : '';
    const [result] = await query(`* [_id == "${id}" ${previewClause}]`);

    if (!disabledCache) {
      cache[id] = result;
    }

    return result;
  }
  /**
   * Gets all the documents of a particular type. In preview mode, if a document
   * has a draft, that will be returned instead.
   */


  async function getAll(type, filterClause) {
    // force typescript to narrow the type using the intersection.
    // TODO: might be a cleaner way to do this. this creates an ugly lookin type
    if (disabledCache) {
      return await query(`* [_type == "${type}"${filterClause ? ` && ${filterClause}` : ''}]`);
    }

    const ids = await query(`* [_type == "${type}"${filterClause ? ` && ${filterClause}` : ''}] { _id }`);
    const idsToFetch = ids.filter(({
      _id
    }) => !cache[_id]);
    const newDocumentList = await query(`* [_id in [${idsToFetch.map(({
      _id
    }) => `'${_id}'`).join(', ')}]]`);

    for (const doc of newDocumentList) {
      cache[doc._id] = doc;
    }

    return ids.map(({
      _id
    }) => cache[_id]);
  }
  /**
   * If a sanity document refers to another sanity document, then you can use this
   * function to expand that document, preserving the type
   */


  async function expand(ref) {
    // this function is primarily for typescript
    const response = await get(null, ref._ref); // since this is a ref, the response will be defined (unless weak reference)

    return response;
  }
  /**
   * Passes a query along to sanity. If preview mode is active and a token is
   * present, it will prefer drafts over the published versions.
   */


  async function query(query) {
    const searchParams = new URLSearchParams();
    const preview = previewModeRef.current && !!token;
    searchParams.set('query', query);
    const response = await jsonFetch(`https://${projectId}.${useCdn ? 'apicdn' : 'api'}.sanity.io/v1/data/query/${dataset}?${searchParams.toString()}`, Object.assign({}, preview && {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }));
    const prefix = 'drafts.';

    if (!preview) {
      return response.result.filter(doc => !doc._id.startsWith(prefix));
    }

    const removeDraftPrefix = _id => _id.startsWith(prefix) ? _id.substring(prefix.length) : _id; // create a lookup of only draft docs


    const draftDocs = response.result.filter(doc => doc._id.startsWith('drafts.')).reduce((acc, next) => {
      acc[removeDraftPrefix(next._id)] = next;
      return acc;
    }, {}); // in this dictionary, if there is draft doc, that will be preferred,
    // otherwise it'll use the published version

    const finalAcc = response.result.reduce((acc, next) => {
      const id = removeDraftPrefix(next._id);
      acc[id] = draftDocs[id] || next;
      return acc;
    }, {});
    return Object.values(finalAcc);
  }
  /**
   * Clears the in-memory cache. The cache can also be disabled when creating
   * the client
   */


  function clearCache() {
    const keys = Object.keys(cache);

    for (const key of keys) {
      delete cache[key];
    }
  }
  /**
   * Flip whether or not this client is using preview mode or not. Useful for
   * preview mode within next.js.
   */


  function setPreviewMode(previewMode) {
    previewModeRef.current = previewMode;
  }

  return {
    get,
    getAll,
    expand,
    query,
    clearCache,
    setPreviewMode
  };
}

export { createClient };
//# sourceMappingURL=index.esm.js.map
