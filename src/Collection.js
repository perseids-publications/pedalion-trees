import React, { Component } from 'react';

class Collection extends Component {
  renderSection(section) {
    const { locus, path, chunks } = section;
    const { start } = chunks;

    return (
      <React.Fragment key={path}>
        <a href={`${path}/${start}`}>
          {locus}
        </a>
        <br />
      </React.Fragment>
    );
  }

  renderRow(publication) {
    const { path, author, work, editors, sections } = publication;

    return (
      <tr className="d-flex" key={path}>
        <th className="col-md-3 d-none d-md-block" scope="row">{author}</th>
        <td className="col-md-4 d-none d-md-block">{work}</td>
        <td className="col-8 col-sm-6 d-block d-md-none">
          <strong>{author}</strong>, <em>{work}</em>
        </td>
        <td className="col-sm-3 col-lg-4 d-none d-sm-block">{editors}</td>
        <td className="col-4 col-sm-3 col-md-2 col-lg-1">
          {sections.map((s) => this.renderSection(s))}
        </td>
      </tr>
    );
  }

  render() {
    const { title, publications } = this.props;

    return (
      <div className="container">
        <div className="row pb-3">
          <div className="col-12">
            {title && <h2>{title}</h2>}
            <table className="table">
              <thead className="thead-light">
                <tr className="d-flex">
                  <th className="col-md-3 d-none d-md-block" scope="col">Author</th>
                  <th className="col-8 col-sm-6 col-md-4" scope="col">Work</th>
                  <th className="col-sm-3 col-lg-4 d-none d-sm-block" scope="col">Editors</th>
                  <th className="col-4 col-sm-3 col-md-2 col-lg-1" scope="col">Locus</th>
                </tr>
              </thead>
              <tbody>
                {publications.map((p) => this.renderRow(p))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
};

export default Collection;
