import React from 'react';
import PropTypes from 'prop-types';

import { chunksType, publicationMatchType, locationType } from '../../lib/types';

import ArethusaWrapper from '../ArethusaWrapper';

import TreebankArethusa from './TreebankArethusa';
import TreebankReact from './TreebankReact';

const Treebank = ({
  treebankReact,
  ...props
}) => {
  if (treebankReact) {
    return (
      <TreebankReact {...props} />
    );
  }

  return (
    <TreebankArethusa {...props} />
  );
};

Treebank.propTypes = {
  arethusa: PropTypes.instanceOf(ArethusaWrapper).isRequired,
  chunks: chunksType.isRequired,
  match: publicationMatchType.isRequired,
  location: locationType.isRequired,
  xml: PropTypes.string.isRequired,
  treebankReact: PropTypes.bool.isRequired,
  setSubdoc: PropTypes.func.isRequired,
};

export default Treebank;
