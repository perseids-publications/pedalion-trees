import React from 'react';

import styles from '../Instructions.module.css';

import doi from './doi.png';
import zenodoHome from './zenodo-home.png';
import zenodoLogin from './zenodo-login.png';
import zenodoAuthorize from './zenodo-authorize.png';
import zenodoConnect from './zenodo-connect.png';
import zenodoDropdown from './zenodo-dropdown.png';
import zenodoSwitch from './zenodo-switch.png';
import zenodoSelectUpload from './zenodo-select-upload.png';
import zenodoUploadList from './zenodo-upload-list.png';
import zenodoUpload from './zenodo-upload.png';
import githubSelectActions from './github-select-actions.png';
import githubSelectRelease from './github-select-release.png';
import githubRunWorkflow from './github-run-workflow.png';
import githubWorkflowInputs from './github-workflow-inputs.png';
import githubEditFile from './github-edit-file.png';
import githubVisualEditor from './github-visual-editor.png';

import { configType } from '../../../lib/types';

import InstructionsHeader from '../InstructionsHeader';

const Doi = ({ config }) => (
  <>
    <InstructionsHeader config={config} title="Digital Object Identifier (DOI)" />
    <div className={`container pt-3 pb-4 ${styles.instructions}`}>
      <div className="row">
        <div className="col">
          <h2>Registering and Referencing your data via DOI</h2>
          <p>
            If you have a DOI for your data, you can reference it easily in the treebank
            template repository&apos;s metadata. This will add a DOI link to the bottom of
            the repository&apos;s home page.
          </p>

          <a
            href={doi}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="img-fluid img-thumbnail mt-0"
              src={doi}
              alt="footer of Treebank Template showing DOI"
            />
          </a>

          <p>
            There are many ways to register DOIs. Your institution may provide this service
            or you can use an open access repository such as
            {' '}
            <a
              href="https://zenodo.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Zenodo
            </a>
            .
          </p>
          <p>
            We describe below the process for using Zenodo. The instructions should be
            similar for other services.
          </p>
          <ol>
            <li>
              <b>Connect Zenodo to GitHub</b>
              <ol>
                <li>
                  If you do not have a Zenodo account:
                  <ol>
                    <li>
                      Visit
                      {' '}
                      <a
                        href="https://zenodo.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        zenodo.org
                      </a>
                      .
                    </li>
                    <li>
                      Click on the
                      {' '}
                      <code>Log in</code>
                      {' '}
                      button.

                      <a href={zenodoHome} target="_blank" rel="noopener noreferrer">
                        <img
                          className="img-fluid img-thumbnail"
                          src={zenodoHome}
                          alt="Zenodo home page"
                        />
                      </a>
                    </li>
                    <li>
                      Click on
                      {' '}
                      <code>Log in with GitHub</code>
                      .

                      <a href={zenodoLogin} target="_blank" rel="noopener noreferrer">
                        <img
                          className="img-fluid img-thumbnail"
                          src={zenodoLogin}
                          alt="Zenodo login page"
                        />
                      </a>
                    </li>
                    <li>
                      Click on the
                      {' '}
                      <code>Authorize zenodo</code>
                      {' '}
                      button.

                      <a href={zenodoAuthorize} target="_blank" rel="noopener noreferrer">
                        <img
                          className="img-fluid img-thumbnail"
                          src={zenodoAuthorize}
                          alt="Zenodo GitHub authorization page"
                        />
                      </a>
                    </li>
                  </ol>
                </li>
                <li>
                  If you already have a Zenodo account but it is not connected to your
                  GitHub account:
                  <ol>
                    <li>
                      Log in to Zenodo.
                    </li>
                    <li>
                      Click the drop-down menu with your email address.
                    </li>
                    <li>
                      Select
                      {' '}
                      <code>GitHub</code>
                      .

                      <a href={zenodoDropdown} target="_blank" rel="noopener noreferrer">
                        <img
                          className="img-fluid img-thumbnail"
                          src={zenodoDropdown}
                          alt="Zenodo home page with drop-down menu expanded"
                        />
                      </a>
                    </li>
                    <li>
                      Click on
                      {' '}
                      <code>Connect</code>
                      .

                      <a href={zenodoConnect} target="_blank" rel="noopener noreferrer">
                        <img
                          className="img-fluid img-thumbnail"
                          src={zenodoConnect}
                          alt="Zenodo settings page GitHub tab when GitHub integration is not set up"
                        />
                      </a>
                    </li>
                    <li>
                      Click on the
                      {' '}
                      <code>Authorize zenodo</code>
                      {' '}
                      button.

                      <a href={zenodoAuthorize} target="_blank" rel="noopener noreferrer">
                        <img
                          className="img-fluid img-thumbnail"
                          src={zenodoAuthorize}
                          alt="Zenodo GitHub authorization page"
                        />
                      </a>
                    </li>
                  </ol>
                </li>
              </ol>
            </li>
            <li>
              <b>Enable Zenodo for repository</b>
              <ol>
                <li>
                  In Zenodo, click on the drop-down menu with your email address and select
                  {' '}
                  <code>GitHub</code>
                  .

                  <a href={zenodoDropdown} target="_blank" rel="noopener noreferrer">
                    <img
                      className="img-fluid img-thumbnail"
                      src={zenodoDropdown}
                      alt="Zenodo home page with drop-down menu expanded"
                    />
                  </a>
                </li>
                <li>
                  Flip the switch for the repository you want to create a DOI for.

                  <a href={zenodoSwitch} target="_blank" rel="noopener noreferrer">
                    <img
                      className="img-fluid img-thumbnail"
                      src={zenodoSwitch}
                      alt="Zenodo settings page GitHub tab when GitHub integration is set up"
                    />
                  </a>
                </li>
              </ol>
            </li>
            <li>
              <b>Create a release</b>
              <ol>
                <li>
                  On the GitHub page for the repository, click on the
                  {' '}
                  <code>Actions</code>
                  {' '}
                  tab.

                  <a href={githubSelectActions} target="_blank" rel="noopener noreferrer">
                    <img
                      className="img-fluid img-thumbnail"
                      src={githubSelectActions}
                      alt="GitHub repository with arrow pointing to actions tab"
                    />
                  </a>
                </li>
                <li>
                  Click on the
                  {' '}
                  <code>release</code>
                  {' '}
                  workflow from the workflow list.
                  (Every time this workflow is run, it archives the code in the GitHub
                  repository using Zenodo.)

                  <a href={githubSelectRelease} target="_blank" rel="noopener noreferrer">
                    <img
                      className="img-fluid img-thumbnail"
                      src={githubSelectRelease}
                      alt="GitHub actions page"
                    />
                  </a>
                </li>
                <li>
                  Click on the
                  {' '}
                  <code>Run workflow</code>
                  {' '}
                  drop-down menu.

                  <a href={githubRunWorkflow} target="_blank" rel="noopener noreferrer">
                    <img
                      className="img-fluid img-thumbnail"
                      src={githubRunWorkflow}
                      alt="release workflow page with Run workflow drop-down menu selected"
                    />
                  </a>
                </li>
                <li>
                  Fill in the version input.
                  The first time that you run this action, you should use
                  {' '}
                  <code>v1.0.0</code>
                  . On subsequent runs, the version you supply should conform to
                  {' '}
                  <a
                    href="https://semver.org/spec/v2.0.0.html"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    SemVer
                  </a>
                  {' '}
                  as much as possible.
                  This means:
                  <ul>
                    <li>
                      If you are fixing a typo or making a
                      similar small change, you only increment the last number (e.g.
                      {' '}
                      <code>v1.0.0</code>
                      {' '}
                      to
                      {' '}
                      <code>v1.0.1</code>
                      ).
                    </li>
                    <li>
                      If new treebanks are added, the middle number should be incremented (e.g.
                      {' '}
                      <code>v2.2.5</code>
                      {' '}
                      to
                      {' '}
                      <code>v2.3.0</code>
                      ).
                    </li>
                    <li>
                      The first number should be incremented if existing treebanks are changed (e.g.
                      {' '}
                      <code>v3.1.1</code>
                      {' '}
                      to
                      {' '}
                      <code>v4.0.0</code>
                      ).
                    </li>
                    <li>
                      See the list of releases for
                      {' '}
                      <a
                        href="https://github.com/perseids-publications/treebank-template/releases"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        perseids-publications/treebank-template
                      </a>
                      {' '}
                      for one example of how SemVer is used in practice.
                    </li>
                  </ul>
                </li>
                <li>
                  Fill in the description input with a one or two sentence description.
                </li>
                <li>
                  Click on the
                  {' '}
                  <code>Run workflow</code>
                  {' '}
                  button.
                  The release workflow will now run.
                  When it is complete, the code will be published and archived with Zenodo.

                  <a href={githubWorkflowInputs} target="_blank" rel="noopener noreferrer">
                    <img
                      className="img-fluid img-thumbnail"
                      src={githubWorkflowInputs}
                      alt="release workflow page with Run workflow drop-down menu selected"
                    />
                  </a>
                </li>
              </ol>
            </li>
            <li>
              <b>Add the DOI to your treebank-template metadata</b>
              <ol>
                <li>
                  Visit Zenodo and click on
                  {' '}
                  <code>Upload</code>
                  . You should now see your repository.

                  <a href={zenodoSelectUpload} target="_blank" rel="noopener noreferrer">
                    <img
                      className="img-fluid img-thumbnail"
                      src={zenodoSelectUpload}
                      alt="Zenodo home page with arrow pointing to Upload button"
                    />
                  </a>
                </li>
                <li>
                  Click on the repository in Zenodo.

                  <a href={zenodoUploadList} target="_blank" rel="noopener noreferrer">
                    <img
                      className="img-fluid img-thumbnail"
                      src={zenodoUploadList}
                      alt="Zenodo list of uploads"
                    />
                  </a>
                </li>
                <li>
                  Copy the DOI for
                  {' '}
                  <b>
                    all versions
                  </b>
                  .
                  (Note that there are multiple DOIs because Zenodo creates a DOI for each release.
                  You specifically want to copy the one for all versions.)

                  <a href={zenodoUpload} target="_blank" rel="noopener noreferrer">
                    <img
                      className="img-fluid img-thumbnail"
                      src={zenodoUpload}
                      alt="Zenodo upload with arrow pointing to DOI for all versions section"
                    />
                  </a>
                </li>
                <li>
                  Return to your GitHub repository.
                </li>
                <li>
                  Navigate to the
                  {' '}
                  <code>src</code>
                  {' '}
                  directory of your repository.
                </li>
                <li>
                  Click on the
                  {' '}
                  <code>config.json</code>
                  {' '}
                  file.
                </li>
                <li>
                  Click on the pencil icon to edit
                  {' '}
                  <code>config.json</code>
                  .

                  <a href={githubEditFile} target="_blank" rel="noopener noreferrer">
                    <img
                      className="img-fluid img-thumbnail"
                      src={githubEditFile}
                      alt="File open in GitHub"
                    />
                  </a>
                </li>
                <li>
                  Replace the value after the
                  {' '}
                  <code>doi</code>
                  {' '}
                  field with your newly reserved DOI.

                  <a href={githubVisualEditor} target="_blank" rel="noopener noreferrer">
                    <img
                      className="img-fluid img-thumbnail"
                      src={githubVisualEditor}
                      alt="GitHub visual editor editing config.json"
                    />
                  </a>
                </li>
                <li>
                  Commit the change to the master branch.
                </li>
              </ol>
            </li>
            <p>
              At this point your treebank-template home page should have the DOI link
              at the bottom and it should link directly to your data in Zenodo.
            </p>
          </ol>
        </div>
      </div>
    </div>
  </>
);

Doi.propTypes = {
  config: configType.isRequired,
};

export default Doi;
