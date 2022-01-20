import React, { Component } from 'react';
import { configType, publicationMatchType, locationType } from '../../lib/types';

import Publication from '../Publication';
import NotFound from '../NotFound';

class PublicationDirector extends Component {
  constructor(props) {
    super(props);

    const { config } = props;
    const argsLookup = {};
    const { logo, link } = config;

    config.collections.forEach((collection) => {
      (collection.publications || []).forEach((publication) => {
        const {
          author, work, editors, path: publicationPath,
        } = publication;

        publication.sections.forEach((section) => {
          const {
            path,
            locus,
            link: publicationLink,
            license,
            notes,
            xml,
            chunks,
          } = section;

          argsLookup[path] = {
            logo,
            link,
            publicationPath,
            author,
            work,
            editors,
            locus,
            publicationLink,
            license,
            notes,
            xml,
            chunks,
          };
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
      return <NotFound config={config} />;
    }

    return <Publication {...args} match={match} location={location} />;
  }
}

PublicationDirector.propTypes = {
  config: configType.isRequired,
  match: publicationMatchType.isRequired,
  location: locationType.isRequired,
};

export default PublicationDirector;
