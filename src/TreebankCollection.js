import React from 'react';
import { Link } from 'react-router-dom';

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
              <Link to="/aeschines/1">1-50</Link>
            </td>
          </tr>
          <tr>
            <th scope="row">Lysias</th>
            <td>Against Agoratus</td>
            <td>Vanessa Gorman</td>
            <td>
              <Link to="/lysias">1-261</Link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

export default TreebankCollection;
