import {
  arrayOf,
  bool,
  element,
  number,
  oneOfType,
  shape,
  string,
} from 'prop-types';

export const chunksType = shape({
  start: number,
  end: number,
  numbers: arrayOf(oneOfType([string])),
});

export const sectionType = shape({
  locus: string.isRequired,
  path: string.isRequired,
  xml: string.isRequired,
  link: string,
  license: string,
  notes: string,
  chunks: chunksType.isRequired,
});

export const publicationType = shape({
  path: string.isRequired,
  author: string.isRequired,
  work: string.isRequired,
  editors: oneOfType([string, arrayOf(string)]).isRequired,
  hidden: bool,
  collapsed: bool,
  sections: arrayOf(sectionType).isRequired,
});

export const collectionType = shape({
  title: oneOfType([string, element]).isRequired,
  text: string,
  hidden: bool,
  publications: arrayOf(publicationType),
});

export const configType = shape({
  logo: string,
  link: string,
  title: oneOfType([string, element]).isRequired,
  subtitle: string.isRequired,
  copyright: string,
  doi: string,
  report: string,
  github: string,
  twitter: string,
  collections: arrayOf(collectionType).isRequired,
});

export const locationType = shape({
  search: string.isRequired,
});

export const publicationMatchType = shape({
  params: shape({
    chunk: string.isRequired,
  }).isRequired,
});

export const publicationGroupMatchType = shape({
  params: shape({
    publication: string.isRequired,
  }).isRequired,
});

export const queryType = shape({
  w: arrayOf(string),
  config: string,
});
