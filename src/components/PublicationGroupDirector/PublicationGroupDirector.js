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
      title, subtitle, report, github, twitter, collections,
    } = config;

    collections.forEach((collection) => {
      (collection.publications || []).forEach((publication) => {
        const { path, author, work } = publication;

        argsLookup[path] = {
          title,
          subtitle,
          report,
          github,
          twitter,
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
    const { match } = this.props;
    const { publication } = match.params;
    const newConfig = this.argsLookup[publication];

    if (newConfig === undefined) {
      return <NotFound />;
    }

    return <PublicationGroup config={newConfig} />;
  }
}

PublicationGroupDirector.propTypes = {
  config: configType.isRequired,
  match: publicationGroupMatchType.isRequired,
};

export default PublicationGroupDirector;
