import React from 'react';
import ReactMarkdown, { uriTransformer } from 'react-markdown';

const transformLinkUri = uri => (
  uriTransformer(uri[0] === '/' ? `${process.env.PUBLIC_URL}${uri}` : uri)
);

const Markdown = props => (
  <ReactMarkdown
    {...props}
    transformLinkUri={transformLinkUri}
  />
);

export default Markdown;
