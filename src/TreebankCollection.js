import React from 'react';

const TreebankCollection = ({ label, treebanks }) => (
  <div className="container">
    <div className="row col-12 pb-3">
      {label && <h2>{label}</h2>}
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
          <tr>
            <th scope="row">Aeschines</th>
            <td>Against Timarchus</td>
            <td>Vanessa Gorman, Bob Gorman</td>
            <td>
              <a href="/aeschines">1-50</a>
            </td>
          </tr>
          <tr>
            <th scope="row">Lysias</th>
            <td>Against Agoratus</td>
            <td>Vanessa Gorman</td>
            <td>
              <a href="/lysias">1-261</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

export default TreebankCollection;
