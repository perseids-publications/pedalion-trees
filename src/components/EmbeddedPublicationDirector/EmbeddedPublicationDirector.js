import React, { Component } from 'react';
import { configType, publicationMatchType, locationType } from '../../lib/types';

import EmbeddedPublication from '../EmbeddedPublication';
import EmbeddedNotFound from '../EmbeddedNotFound';

class EmbeddedPublicationDirector extends Component {
  constructor(props) {
    super(props);

    const { config } = props;
    const argsLookup = {};

    config.collections.forEach((collection) => {
      (collection.publications || []).forEach((publication) => {
        publication.sections.forEach((section) => {
          const { path, xml } = section;

          argsLookup[path] = { xml };
        });
      });
    });

    this.argsLookup = argsLookup;
  }

  render() {
    const { config, match, location } = this.props;
    const { publication } = match.params;
    const args = this.argsLookup[publication];

    if (args === undefined) {
      return <EmbeddedNotFound config={config} />;
    }

    const { xml } = args;

    return <EmbeddedPublication xml={xml} match={match} location={location} />;
  }
}

EmbeddedPublicationDirector.propTypes = {
  config: configType.isRequired,
  match: publicationMatchType.isRequired,
  location: locationType.isRequired,
};

export default EmbeddedPublicationDirector;
