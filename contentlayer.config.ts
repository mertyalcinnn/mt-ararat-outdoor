import { defineDocumentType, makeSource } from 'contentlayer/source-files';

export const Homepage = defineDocumentType(() => ({
  name: 'Homepage',
  filePathPattern: 'homepage/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    description: { type: 'string', required: true },
    heroImage: { type: 'string', required: true }
  },
}));

export const Activity = defineDocumentType(() => ({
  name: 'Activity',
  filePathPattern: 'activities/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    slug: { type: 'string', required: true },
    description: { type: 'string', required: true },
    coverImage: { type: 'string', required: true },
    gallery: { type: 'list', of: { type: 'string' }, default: [] },
    duration: { type: 'string', required: true },
    difficultyLevel: { type: 'string', required: true },
    includedServices: { type: 'list', of: { type: 'string' }, default: [] },
    price: { type: 'string', required: true },
    featured: { type: 'boolean', default: false },
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: (doc) => `/activities/${doc.slug}`,
    },
  },
}));

export const About = defineDocumentType(() => ({
  name: 'About',
  filePathPattern: 'about/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    teamMembers: {
      type: 'list',
      of: {
        type: 'object',
        fields: {
          name: { type: 'string', required: true },
          role: { type: 'string', required: true },
          bio: { type: 'string', required: true },
          image: { type: 'string', required: true },
        },
      },
      default: [],
    },
  },
}));

export const Contact = defineDocumentType(() => ({
  name: 'Contact',
  filePathPattern: 'contact/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    address: { type: 'string', required: true },
    email: { type: 'string', required: true },
    phone: { type: 'string', required: true },
    mapLocation: { type: 'string', required: true },
  },
}));

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Homepage, Activity, About, Contact],
});