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
      <tr key={path}>
        <th scope="row" style={{ wordBreak: "break-word", hyphens: "auto" }}>{author}</th>
        <td>{work}</td>
        <td>{editors}</td>
        <td>
          {sections.map((s) => this.renderSection(s))}
        </td>
      </tr>
    );
  }

  render() {
    const { title, publications } = this.props;

    return (
      <div className="container">
        <div className="row col-12 pb-3">
          {title && <h2>{title}</h2>}
          <table className="table">
            <thead className="thead-light">
              <tr>
                <th scope="col">Author</th>
                <th scope="col">Work</th>
                <th scope="col">Editors</th>
                <th scope="col">Locus</th>
              </tr>
            </thead>
            <tbody>
              {publications.map((p) => this.renderRow(p))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
};

export default Collection;
