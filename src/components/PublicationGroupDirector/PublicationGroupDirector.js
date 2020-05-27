import React, { Component } from 'react';

import { configType, publicationGroupMatchType } from '../../lib/types';

import PublicationGroup from '../PublicationGroup';
import NotFound from '../NotFound';

class PublicationGroupDirector extends Component {
  constructor(props) {
    super(props);

    const { config } = props;
    const argsLookup = {};
    const {
      logo,
      link,
      title,
      subtitle,
      collections,
    } = config;

    collections.forEach((collection) => {
      (collection.publications || []).forEach((publication) => {
        const { path, author, work } = publication;

        argsLookup[path] = {
          logo,
          link,
          title,
          subtitle,
          collections: [
            {
              title: (
                <>
                  {author}
                  ,
                  {' '}
                  <i>{work}</i>
                </>
              ),
              publications: [publication],
            },
          ],
        };
      });
    });

    this.argsLookup = argsLookup;
  }

  render() {
    const { config, match } = this.props;
    const { publication } = match.params;
    const newConfig = this.argsLookup[publication];

    if (newConfig === undefined) {
      return <NotFound config={config} />;
    }

    return <PublicationGroup config={newConfig} />;
  }
}

PublicationGroupDirector.propTypes = {
  config: configType.isRequired,
  match: publicationGroupMatchType.isRequired,
};

export default PublicationGroupDirector;
