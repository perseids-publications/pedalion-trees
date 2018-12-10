import React from 'react';

const TreebankCollection2 = ({ label, treebanks }) => (
  <div className="container">
    <div class="row col-12 pb-3">
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
            <th scope="row">Polybius</th>
            <td>Histories</td>
            <td>Bob Gorman</td>
            <td>
              <a href="">100-200</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

export default TreebankCollection2;
