import {
  arrayOf, number, shape, string,
} from 'prop-types';

export const chunksType = shape({
  start: number.isRequired,
  end: number.isRequired,
});

export const sectionType = shape({
  locus: string.isRequired,
  path: string.isRequired,
  xml: string.isRequired,
  link: string,
  notes: string,
  chunks: chunksType.isRequired,
});

export const publicationType = shape({
  path: string.isRequired,
  author: string.isRequired,
  work: string.isRequired,
  editors: string.isRequired,
  sections: arrayOf(sectionType).isRequired,
});

export const collectionType = shape({
  title: string.isRequired,
  publications: arrayOf(publicationType).isRequired,
});

export const configType = shape({
  title: string.isRequired,
  subtitle: string.isRequired,
  copyright: string,
  report: string,
  github: string,
  twitter: string,
  collections: arrayOf(collectionType).isRequired,
});

export const matchType = shape({
  params: shape({
    chunk: string.isRequired,
  }).isRequired,
});
