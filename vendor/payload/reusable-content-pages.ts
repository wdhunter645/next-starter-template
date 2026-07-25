import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  access: {
    create: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
    read: ({ req }) => req.user ? true : { _status: { equals: 'published' } },
    update: ({ req }) => Boolean(req.user),
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    useAsTitle: 'title',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'layout',
      type: 'blocks',
      blocks: [],
      required: true,
      admin: { initCollapsed: true },
    },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
    { name: 'slug', type: 'text', required: true, unique: true },
  ],
  versions: {
    drafts: { autosave: { interval: 100 }, schedulePublish: true },
    maxPerDoc: 50,
  },
}
