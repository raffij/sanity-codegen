import createClient from './create-client';

describe('query', () => {
  it('prefers draft documents in preview mode', async () => {
    const postOne = {
      _createdAt: '2020-10-24T03:00:29Z',
      _id: 'post-one',
      _rev: 'rev',
      _type: 'post',
      _updatedAt: '2020-10-24T03:04:54Z',
    };
    const postTwo = {
      _createdAt: '2020-10-24T03:00:29Z',
      _id: 'post-two',
      _rev: 'rev',
      _type: 'post',
      _updatedAt: '2020-10-24T03:04:54Z',
    };
    const postTwoDraft = {
      _createdAt: '2020-10-24T03:00:29Z',
      _id: 'drafts.post-two',
      _rev: 'rev',
      _type: 'post',
      _updatedAt: '2020-10-24T03:04:54Z',
    };

    const mockFetch: any = jest.fn(() => ({
      ok: true,
      json: () => Promise.resolve({ result: [postOne, postTwo, postTwoDraft] }),
    }));

    const sanity = createClient({
      projectId: 'test-project-id',
      dataset: 'test-dataset',
      fetch: mockFetch,
      previewMode: true,
      token: 'test-token',
    });

    const docs = await sanity.query('*');

    expect(docs).toEqual([postOne, postTwoDraft]);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "https://test-project-id.api.sanity.io/v1/data/query/test-dataset?query=*",
        Object {
          "headers": Object {
            "Accept": "application/json",
            "Authorization": "Bearer test-token",
          },
        },
      ]
    `);
  });

  it('conditionally applies tokens and CDN endpoints', async () => {
    const postOne = {
      _createdAt: '2020-10-24T03:00:29Z',
      _id: 'post-one',
      _rev: 'rev',
      _type: 'post',
      _updatedAt: '2020-10-24T03:04:54Z',
    };
    const postTwo = {
      _createdAt: '2020-10-24T03:00:29Z',
      _id: 'post-two',
      _rev: 'rev',
      _type: 'post',
      _updatedAt: '2020-10-24T03:04:54Z',
    };
    const postTwoDraft = {
      _createdAt: '2020-10-24T03:00:29Z',
      _id: 'drafts.post-two',
      _rev: 'rev',
      _type: 'post',
      _updatedAt: '2020-10-24T03:04:54Z',
    };

    const mockFetch: any = jest.fn(() => ({
      ok: true,
      json: () => Promise.resolve({ result: [postOne, postTwo, postTwoDraft] }),
    }));

    const sanity = createClient({
      projectId: 'test-project-id',
      dataset: 'test-dataset',
      fetch: mockFetch,
      previewMode: false,
      token: 'test-token',
      useCdn: true,
    });

    const docs = await sanity.query('*');

    expect(docs).toEqual([postOne, postTwo]);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "https://test-project-id.apicdn.sanity.io/v1/data/query/test-dataset?query=*",
        Object {
          "headers": Object {
            "Accept": "application/json",
          },
        },
      ]
    `);
  });
});

describe('get', () => {
  it('gets one document from the sanity instance', async () => {
    const mockDoc = {
      _createdAt: '2020-10-24T03:00:29Z',
      _id: 'settings',
      _rev: 'XoaOTvah7ZFSBIsJK8Ahfx',
      _type: 'settings',
      _updatedAt: '2020-10-24T03:04:54Z',
    };

    const mockFetch: any = jest.fn(() => ({
      ok: true,
      json: () => Promise.resolve({ result: [mockDoc] }),
    }));

    const sanity = createClient({
      projectId: 'test-project-id',
      dataset: 'test-dataset',
      fetch: mockFetch,
    });

    const doc = await sanity.get('settings', 'settings');

    expect(doc).toBe(mockDoc);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "https://test-project-id.api.sanity.io/v1/data/query/test-dataset?query=*+%5B_id+%3D%3D+%22settings%22+%5D",
        Object {
          "headers": Object {
            "Accept": "application/json",
          },
        },
      ]
    `);
  });

  it('returns a draft doc if in preview mode', async () => {
    const mockDoc = {
      _createdAt: '2020-10-24T03:00:29Z',
      _id: 'settings',
      _rev: 'XoaOTvah7ZFSBIsJK8Ahfx',
      _type: 'settings',
      _updatedAt: '2020-10-24T03:04:54Z',
    };
    const mockDraftDoc = {
      _createdAt: '2020-10-24T03:00:29Z',
      _id: 'drafts.settings',
      _rev: 'XoaOTvah7ZFSBIsJK8Ahfx',
      _type: 'settings',
      _updatedAt: '2020-10-24T03:04:54Z',
    };

    const mockFetch: any = jest.fn(() => ({
      ok: true,
      json: () => Promise.resolve({ result: [mockDoc, mockDraftDoc] }),
    }));

    const sanity = createClient({
      projectId: 'test-project-id',
      dataset: 'test-dataset',
      fetch: mockFetch,
      previewMode: true,
      token: 'test-token',
    });

    const doc = await sanity.get('settings', 'settings');

    expect(doc).toBe(mockDraftDoc);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "https://test-project-id.api.sanity.io/v1/data/query/test-dataset?query=*+%5B_id+%3D%3D+%22settings%22+%7C%7C+_id%3D%3D%22drafts.settings%22%5D",
        Object {
          "headers": Object {
            "Accept": "application/json",
            "Authorization": "Bearer test-token",
          },
        },
      ]
    `);
  });

  it('caches the result between create client calls', async () => {
    const mockDoc = {
      _createdAt: '2020-10-24T03:00:29Z',
      _id: 'settings',
      _rev: 'XoaOTvah7ZFSBIsJK8Ahfx',
      _type: 'settings',
      _updatedAt: '2020-10-24T03:04:54Z',
    };

    const mockFetch: any = jest.fn(() => ({
      ok: true,
      json: () => Promise.resolve({ result: [mockDoc] }),
    }));

    const sanity = createClient({
      projectId: 'test-project-id',
      dataset: 'test-dataset',
      fetch: mockFetch,
    });

    const once = await sanity.get('settings', 'settings');
    const twice = await sanity.get('settings', 'settings');

    expect(once).toBe(mockDoc);
    expect(twice).toBe(mockDoc);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "https://test-project-id.api.sanity.io/v1/data/query/test-dataset?query=*+%5B_id+%3D%3D+%22settings%22+%5D",
        Object {
          "headers": Object {
            "Accept": "application/json",
          },
        },
      ]
    `);
  });

  it('allows the cache calls to be disabled', async () => {
    const mockDoc = {
      _createdAt: '2020-10-24T03:00:29Z',
      _id: 'settings',
      _rev: 'XoaOTvah7ZFSBIsJK8Ahfx',
      _type: 'settings',
      _updatedAt: '2020-10-24T03:04:54Z',
    };

    const mockFetch: any = jest.fn(() => ({
      ok: true,
      json: () => Promise.resolve({ result: [mockDoc] }),
    }));

    const sanity = createClient({
      projectId: 'test-project-id',
      dataset: 'test-dataset',
      fetch: mockFetch,
      disabledCache: true,
    });

    await sanity.get('settings', 'settings');
    await sanity.get('settings', 'settings');

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "https://test-project-id.api.sanity.io/v1/data/query/test-dataset?query=*+%5B_id+%3D%3D+%22settings%22+%5D",
        Object {
          "headers": Object {
            "Accept": "application/json",
          },
        },
      ]
    `);
  });
});

describe('getAll', () => {
  it('returns all the documents of a particular type', async () => {
    const postOne = {
      _createdAt: '2020-10-24T03:00:29Z',
      _id: 'post-one',
      _rev: 'rev',
      _type: 'post',
      _updatedAt: '2020-10-24T03:04:54Z',
    };
    const postTwo = {
      _createdAt: '2020-10-24T03:00:29Z',
      _id: 'post-two',
      _rev: 'rev',
      _type: 'post',
      _updatedAt: '2020-10-24T03:04:54Z',
    };
    const postTwoDraft = {
      _createdAt: '2020-10-24T03:00:29Z',
      _id: 'drafts.post-two',
      _rev: 'rev',
      _type: 'post',
      _updatedAt: '2020-10-24T03:04:54Z',
    };

    const mockFetch: any = jest.fn(() => ({
      ok: true,
      json: () => Promise.resolve({ result: [postOne, postTwo, postTwoDraft] }),
    }));

    const sanity = createClient({
      projectId: 'test-project-id',
      dataset: 'test-dataset',
      fetch: mockFetch,
    });
    const docs = await sanity.getAll('post');

    expect(docs).toEqual([postOne, postTwo]);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "https://test-project-id.api.sanity.io/v1/data/query/test-dataset?query=*+%5B_type+%3D%3D+%22post%22%5D+%7B+_id+%7D",
          Object {
            "headers": Object {
              "Accept": "application/json",
            },
          },
        ],
        Array [
          "https://test-project-id.api.sanity.io/v1/data/query/test-dataset?query=*+%5B_id+in+%5B%27post-one%27%2C+%27post-two%27%5D%5D",
          Object {
            "headers": Object {
              "Accept": "application/json",
            },
          },
        ],
      ]
    `);
  });

  it('does not re-fetch cached values', async () => {
    const postOne = {
      _createdAt: '2020-10-24T03:00:29Z',
      _id: 'post-one',
      _rev: 'rev',
      _type: 'post',
      _updatedAt: '2020-10-24T03:04:54Z',
    };
    const postTwo = {
      _createdAt: '2020-10-24T03:00:29Z',
      _id: 'post-two',
      _rev: 'rev',
      _type: 'post',
      _updatedAt: '2020-10-24T03:04:54Z',
    };
    const postTwoDraft = {
      _createdAt: '2020-10-24T03:00:29Z',
      _id: 'drafts.post-two',
      _rev: 'rev',
      _type: 'post',
      _updatedAt: '2020-10-24T03:04:54Z',
    };

    const mockFetch: any = jest.fn(() => ({
      ok: true,
      json: () => Promise.resolve({ result: [postOne, postTwo, postTwoDraft] }),
    }));

    const sanity = createClient({
      projectId: 'test-project-id',
      dataset: 'test-dataset',
      fetch: mockFetch,
    });

    await sanity.get('post', 'post-one');

    const docs = await sanity.getAll('post');

    expect(docs).toEqual([postOne, postTwo]);

    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(mockFetch.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "https://test-project-id.api.sanity.io/v1/data/query/test-dataset?query=*+%5B_id+%3D%3D+%22post-one%22+%5D",
          Object {
            "headers": Object {
              "Accept": "application/json",
            },
          },
        ],
        Array [
          "https://test-project-id.api.sanity.io/v1/data/query/test-dataset?query=*+%5B_type+%3D%3D+%22post%22%5D+%7B+_id+%7D",
          Object {
            "headers": Object {
              "Accept": "application/json",
            },
          },
        ],
        Array [
          "https://test-project-id.api.sanity.io/v1/data/query/test-dataset?query=*+%5B_id+in+%5B%27post-two%27%5D%5D",
          Object {
            "headers": Object {
              "Accept": "application/json",
            },
          },
        ],
      ]
    `);
  });

  it('only makes one network call when the cache is disabled', async () => {
    const postOne = {
      _createdAt: '2020-10-24T03:00:29Z',
      _id: 'post-one',
      _rev: 'rev',
      _type: 'post',
      _updatedAt: '2020-10-24T03:04:54Z',
    };
    const postTwo = {
      _createdAt: '2020-10-24T03:00:29Z',
      _id: 'post-two',
      _rev: 'rev',
      _type: 'post',
      _updatedAt: '2020-10-24T03:04:54Z',
    };
    const postTwoDraft = {
      _createdAt: '2020-10-24T03:00:29Z',
      _id: 'drafts.post-two',
      _rev: 'rev',
      _type: 'post',
      _updatedAt: '2020-10-24T03:04:54Z',
    };

    const mockFetch: any = jest.fn(() => ({
      ok: true,
      json: () => Promise.resolve({ result: [postOne, postTwo, postTwoDraft] }),
    }));

    const sanity = createClient({
      projectId: 'test-project-id',
      dataset: 'test-dataset',
      fetch: mockFetch,
      disabledCache: true,
    });
    const docs = await sanity.getAll('post');

    expect(docs).toEqual([postOne, postTwo]);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "https://test-project-id.api.sanity.io/v1/data/query/test-dataset?query=*+%5B_type+%3D%3D+%22post%22%5D",
          Object {
            "headers": Object {
              "Accept": "application/json",
            },
          },
        ],
      ]
    `);
  });

  it('passes the filter param', async () => {
    const postOne = {
      _createdAt: '2020-10-24T03:00:29Z',
      _id: 'post-one',
      _rev: 'rev',
      _type: 'post',
      _updatedAt: '2020-10-24T03:04:54Z',
    };
    const postTwo = {
      _createdAt: '2020-10-24T03:00:29Z',
      _id: 'post-two',
      _rev: 'rev',
      _type: 'post',
      _updatedAt: '2020-10-24T03:04:54Z',
    };

    const mockFetch: any = jest.fn(() => ({
      ok: true,
      json: () => Promise.resolve({ result: [postOne, postTwo] }),
    }));

    const sanity = createClient({
      projectId: 'test-project-id',
      dataset: 'test-dataset',
      fetch: mockFetch,
    });
    const docs = await sanity.getAll('post', 'name == "test"');

    expect(docs).toEqual([postOne, postTwo]);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "https://test-project-id.api.sanity.io/v1/data/query/test-dataset?query=*+%5B_type+%3D%3D+%22post%22+%26%26+name+%3D%3D+%22test%22%5D+%7B+_id+%7D",
          Object {
            "headers": Object {
              "Accept": "application/json",
            },
          },
        ],
        Array [
          "https://test-project-id.api.sanity.io/v1/data/query/test-dataset?query=*+%5B_id+in+%5B%27post-one%27%2C+%27post-two%27%5D%5D",
          Object {
            "headers": Object {
              "Accept": "application/json",
            },
          },
        ],
      ]
    `);
  });

  it('prefers draft documents in preview mode', async () => {
    const postOne = {
      _createdAt: '2020-10-24T03:00:29Z',
      _id: 'post-one',
      _rev: 'rev',
      _type: 'post',
      _updatedAt: '2020-10-24T03:04:54Z',
    };
    const postTwo = {
      _createdAt: '2020-10-24T03:00:29Z',
      _id: 'post-two',
      _rev: 'rev',
      _type: 'post',
      _updatedAt: '2020-10-24T03:04:54Z',
    };
    const postTwoDraft = {
      _createdAt: '2020-10-24T03:00:29Z',
      _id: 'drafts.post-two',
      _rev: 'rev',
      _type: 'post',
      _updatedAt: '2020-10-24T03:04:54Z',
    };

    const mockFetch: any = jest.fn(() => ({
      ok: true,
      json: () => Promise.resolve({ result: [postOne, postTwo, postTwoDraft] }),
    }));

    const sanity = createClient({
      projectId: 'test-project-id',
      dataset: 'test-dataset',
      fetch: mockFetch,
      previewMode: true,
      token: 'test-token',
    });

    const docs = await sanity.getAll('post');

    expect(docs).toEqual([postOne, postTwoDraft]);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "https://test-project-id.api.sanity.io/v1/data/query/test-dataset?query=*+%5B_type+%3D%3D+%22post%22%5D+%7B+_id+%7D",
        Object {
          "headers": Object {
            "Accept": "application/json",
            "Authorization": "Bearer test-token",
          },
        },
      ]
    `);
  });
});

describe('expand', () => {
  it('calls get with a ref id', async () => {
    const mockDoc = {
      _createdAt: '2020-10-24T03:00:29Z',
      _id: 'settings',
      _rev: 'XoaOTvah7ZFSBIsJK8Ahfx',
      _type: 'settings',
      _updatedAt: '2020-10-24T03:04:54Z',
    };

    const mockFetch: any = jest.fn(() => ({
      ok: true,
      json: () => Promise.resolve({ result: [mockDoc] }),
    }));

    const sanity = createClient({
      projectId: 'test-project-id',
      dataset: 'test-dataset',
      fetch: mockFetch,
    });

    const mockRef = {
      _ref: 'settings',
      _type: 'reference' as 'reference',
      _key: '-',
    };

    const doc = await sanity.expand(mockRef);

    expect(doc).toBe(mockDoc);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "https://test-project-id.api.sanity.io/v1/data/query/test-dataset?query=*+%5B_id+%3D%3D+%22settings%22+%5D",
        Object {
          "headers": Object {
            "Accept": "application/json",
          },
        },
      ]
    `);
  });
});

describe('clearCache', () => {
  it('clears the caches', async () => {
    const mockDoc = {
      _createdAt: '2020-10-24T03:00:29Z',
      _id: 'settings',
      _rev: 'XoaOTvah7ZFSBIsJK8Ahfx',
      _type: 'settings',
      _updatedAt: '2020-10-24T03:04:54Z',
    };

    const mockFetch: any = jest.fn(() => ({
      ok: true,
      json: () => Promise.resolve({ result: [mockDoc] }),
    }));

    const sanity = createClient({
      projectId: 'test-project-id',
      dataset: 'test-dataset',
      fetch: mockFetch,
    });

    const once = await sanity.get('settings', 'settings');
    sanity.clearCache();
    const twice = await sanity.get('settings', 'settings');

    expect(once).toBe(mockDoc);
    expect(twice).toBe(mockDoc);

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
