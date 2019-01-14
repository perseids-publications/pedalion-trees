import React, { Component } from 'react';

import Publication from './Publication';

class PublicationDirector extends Component {
  constructor(props) {
    super(props);

    const { config } = props;
    const argsLookup = {};

    config.collections.forEach((collection) => {
      collection.publications.forEach((publication) => {
        const {
          author, work, editors, path: publicationPath,
        } = publication;

        publication.sections.forEach((section) => {
          const {
            path, locus, link, notes, xml, chunks,
          } = section;

          argsLookup[path] = {
            publicationPath,
            author,
            work,
            editors,
            locus,
            link,
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
    const { match } = this.props;
    const { publication } = match.params;
    const args = this.argsLookup[publication];

    return <Publication {...args} match={match} />;
  }
}

export default PublicationDirector;
