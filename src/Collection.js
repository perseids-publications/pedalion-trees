import React from 'react';
import PropTypes from 'prop-types';

import { publicationType } from './types';

const getStart = (chunks) => {
  const { start, numbers } = chunks;

  if (start) {
    return start;
  }

  return numbers[0];
};

const renderSection = (section) => {
  const { locus, path, chunks } = section;
  const start = getStart(chunks);

  return (
    <React.Fragment key={path}>
      <a href={`${path}/${start}`}>
        {locus}
      </a>
      <br />
    </React.Fragment>
  );
};

const renderRow = (publication) => {
  const {
    path,
    author,
    work,
    editors,
    sections,
  } = publication;

  return (
    <tr className="d-flex" key={path}>
      <th className="col-md-3 d-none d-md-block" scope="row">{author}</th>
      <td className="col-md-4 d-none d-md-block">{work}</td>
      <td className="col-8 col-sm-6 d-block d-md-none">
        <strong>{author}</strong>
        ,
        <em>{work}</em>
      </td>
      <td className="col-sm-3 col-lg-3 d-none d-sm-block">{editors}</td>
      <td className="col-4 col-sm-3 col-md-2 col-lg-2 text-right">
        {sections.map(s => renderSection(s))}
      </td>
    </tr>
  );
};

const Collection = ({ title, publications }) => (
  <div className="container">
    <div className="row pb-3">
      <div className="col-12">
        {title && <h2>{title}</h2>}
        <table className="table">
          <thead className="thead-light">
            <tr className="d-flex">
              <th className="col-md-3 d-none d-md-block" scope="col">Author</th>
              <th className="col-8 col-sm-6 col-md-4" scope="col">Work</th>
              <th className="col-sm-3 col-lg-3 d-none d-sm-block" scope="col">Editors</th>
              <th className="col-4 col-sm-3 col-md-2 col-lg-2" scope="col">Locus</th>
            </tr>
          </thead>
          <tbody>
            {publications.map(p => renderRow(p))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

Collection.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  publications: PropTypes.arrayOf(publicationType).isRequired,
};

export default Collection;
