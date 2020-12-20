import React from 'react';
import { Link } from 'react-router-dom';

import styles from '../Instructions.module.css';

import fork from './fork.png';
import forked from './forked.png';
import actionsEnable from './actions-enable.png';
import packageJson from './package.png';
import edit from './edit.png';
import homepage from './homepage.png';
import commit from './commit.png';
import settings from './settings.png';
import ghpages from './ghpages.png';
import configuration from './config.png';
import configEdit from './config-edit.png';
import progress from './progress.png';
import success from './success.png';
import site from './site.png';
import env from './env.png';
import upload from './upload.png';
import myTreesConfig from './mytrees-config.png';
import myTreesSite from './mytrees-site.png';

import { configType } from '../../../lib/types';

import InstructionsHeader from '../InstructionsHeader';

const GettingStarted = ({ config }) => (
  <>
    <InstructionsHeader config={config} title="Getting Started" />
    <div className={`container pt-3 pb-4 ${styles.instructions}`}>
      <div className="row">
        <div className="col">
          <h2>Overview</h2>

          <p>
            These instructions walk you through the basics of getting started with
            creating your own repository for publishing treebank data on GitHub using
            the Perseids Publications Treebank Template.
          </p>
        </div>
      </div>

      <div className="row">
        <div className="col">
          <h2>Minimum Prerequisities</h2>

          <ol>
            <li>
              Have some treebank data files to publish. Currently this publication
              template requires treebank XML files that adhere to the
              {' '}
              <a
                href="https://perseusdl.github.io/treebank_data/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Perseus Ancient Greek and Latin Treebank (AGDT)
              </a>
              {' '}
              Schema and one of the
              {' '}
              <a
                href="https://github.com/alpheios-project/arethusa-configs/tree/master/configs"
                target="_blank"
                rel="noopener noreferrer"
              >
                tagsets
              </a>
              {' '}
              supported by Arethusa. For more information on
              compliant treebank data with Perseids and Arethusa see the
              {' '}
              <a href="https://perseids.org" target="_blank" rel="noopener noreferrer">
                Perseids
              </a>
              {' '}
              website or email perseids at tufts dot edu.
            </li>

            <li>
              Create an account on
              {' '}
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              .
            </li>

            <li>
              Although not absolutely necessary just to get started, we recommend getting
              familiar with how to use
              {' '}
              <a
                href="https://help.github.com/en/github/getting-started-with-github"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub and the Git version control system
              </a>
              {' '}
              as well as having a basic understanding of how to edit and create
              create
              {' '}
              <a
                href="https://www.w3schools.com/js/js_json_intro.asp"
                target="_blank"
                rel="noopener noreferrer"
              >
                JSON
              </a>
              {' '}
              files. Without these skills it may be difficult
              for you to fully manage your treebank publication site and troubleshoot
              any problems you might encounter with it.
            </li>
          </ol>
        </div>
      </div>

      <div className="row">
        <div className="col">
          <h2>Instructions</h2>

          <ol className={styles.list}>
            <li>
              <strong>
                Fork the base Repository
              </strong>
              <ol>
                <li>
                  Log in to your GitHub account at
                  {' '}
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                    https://github.com
                  </a>
                  .
                </li>
                <li>
                  Go to
                  {' '}
                  <a
                    href="https://github.com/perseids-publications/treebank-template"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://github.com/perseids-publications/treebank-template
                  </a>
                  .
                </li>
                <li>
                  Click the
                  {' '}
                  <code>Fork</code>
                  {' '}
                  button.

                  <a href={fork} target="_blank" rel="noopener noreferrer">
                    <img
                      className="img-fluid img-thumbnail"
                      src={fork}
                      alt="arrow pointing to fork button on GitHub page"
                    />
                  </a>
                  This puts a copy of the treebank-template repository into your own
                  GitHub account.
                </li>
              </ol>
            </li>
            <li>
              <strong>
                Set Up GitHub Actions
              </strong>
              <ol>
                <li>
                  Immediately after forking the repository, you should be prompted
                  by GitHub to enable actions on your repository.
                  Click
                  {' '}
                  <code>
                    Set Up Actions
                  </code>
                  .

                  <a href={forked} target="_blank" rel="noopener noreferrer">
                    <img
                      className="img-fluid img-thumbnail"
                      src={forked}
                      alt="GitHub page of repository after successful fork"
                    />
                  </a>

                </li>
                <li>
                  (If you aren&apos;t prompted, click on the
                  {' '}
                  <code>
                    Actions
                  </code>
                  {' '}
                  tab
                  yourself anyway.)
                </li>
                <li>
                  Click
                  {' '}
                  <code>
                    I understand my workflows, go ahead and enable them
                  </code>
                  .

                  <a href={actionsEnable} target="_blank" rel="noopener noreferrer">
                    <img
                      className="img-fluid img-thumbnail"
                      src={actionsEnable}
                      alt="arrow pointing to the button on GitHub to enable Actions"
                    />
                  </a>

                  This step is necessary in order for GitHub to update your GitHub Pages
                  site automatically whenever you update or add files to your repository.
                  For more information on GitHub actions see
                  {' '}
                  <a href="https://help.github.com/en/actions" target="_blank" rel="noopener noreferrer">
                    GitHub Actions Help
                  </a>
                  .
                </li>
              </ol>
            </li>
            <li>
              <strong>
                Update the home page link for your site
              </strong>
              <ol>
                <li>
                  Click the
                  {' '}
                  <code>
                    package.json
                  </code>
                  {' '}
                  file in the root directory of
                  the repository.

                  <a href={packageJson} target="_blank" rel="noopener noreferrer">
                    <img
                      className="img-fluid img-thumbnail"
                      src={packageJson}
                      alt="arrow pointing to package.json file on repository page on GitHub"
                    />
                  </a>

                </li>
                <li>
                  Click the
                  {' '}
                  <code>
                    edit
                  </code>
                  {' '}
                  icon.

                  <a href={edit} target="_blank" rel="noopener noreferrer">
                    <img
                      className="img-fluid img-thumbnail"
                      src={edit}
                      alt="arrow pointing to GitHub's edit button"
                    />
                  </a>

                </li>
                <li>
                  Replace
                  {' '}
                  <code>
                    perseids-publications.github.io
                  </code>
                  {' '}
                  with, e.g.,
                  {' '}
                  <code>
                    yourgithubaccount.github.io
                  </code>
                  .
                  That is, if your GitHub user name is &quot;janedoe&quot; you would change
                  {' '}
                  <code>
                    https://perseids-publications.github.io/treebank-template/
                  </code>
                  {' '}
                  to
                  {' '}
                  <code>
                    https://janedoe.github.io/treebank-template/
                  </code>
                  .

                  <a href={homepage} target="_blank" rel="noopener noreferrer">
                    <img
                      className="img-fluid img-thumbnail"
                      src={homepage}
                      alt="GitHub's visual editor with homepage line highlighted"
                    />
                  </a>

                </li>
                <li>
                  Scroll to the bottom of the page to
                  {' '}
                  <code>
                    Commit changes
                  </code>
                  {' '}
                  and enter a message to describe your
                  change to this file (e.g. something like &quot;Updated homepage link&quot;).
                </li>
                <li>
                  Make sure the option
                  {' '}
                  <code>
                    Commit directly to the master branch
                  </code>
                  {' '}
                  is selected.

                  <a href={commit} target="_blank" rel="noopener noreferrer">
                    <img
                      className="img-fluid img-thumbnail"
                      src={commit}
                      alt="GitHub page for creating a manual commit with arrow pointing to commit option"
                    />
                  </a>

                </li>
                <li>
                  Click
                  {' '}
                  <code>
                    Commit changes
                  </code>
                  .
                </li>
              </ol>
            </li>
            <li>
              <strong>
                Set Up GitHub Pages
              </strong>
              <ol>
                <li>
                  Click the
                  {' '}
                  <code>
                    Settings
                  </code>
                  {' '}
                  button.

                  <a href={settings} target="_blank" rel="noopener noreferrer">
                    <img
                      className="img-fluid img-thumbnail"
                      src={settings}
                      alt="GitHub settings page"
                    />
                  </a>

                </li>
                <li>
                  Scroll down to the
                  {' '}
                  <code>
                    GitHub Pages
                  </code>
                  {' '}
                  section of the page.
                </li>
                <li>
                  Select
                  {' '}
                  <code>
                    gh-pages branch
                  </code>
                  {' '}
                  for the source from the
                  dropdown.
                  {' '}
                  <strong>
                    NOTE:
                  </strong>
                  {' '}
                  it is important that you select the
                  {' '}
                  <code>
                    gh-pages branch
                  </code>
                  {' '}
                  option from the dropdown,
                  {' '}
                  <strong>
                    even if
                    its preselected
                  </strong>
                  .
                  It seems that the process of actually selecting it is
                  necessary to trigger GitHub to actually acknowledge the setting.
                  After this, you should see a notice
                  {' '}
                  <code>
                    Your site is ready to be
                    published at https://youraccount.github.io/treebank-template
                  </code>
                  .

                  <a href={ghpages} target="_blank" rel="noopener noreferrer">
                    <img
                      className="img-fluid img-thumbnail"
                      src={ghpages}
                      alt="GitHub pages section of GitHub repository settings"
                    />
                  </a>

                </li>
              </ol>
            </li>
            <li>
              <strong>
                Update Site Details
              </strong>
              <ol>
                <li>
                  Go back to the
                  {' '}
                  <code>
                    Code
                  </code>
                  {' '}
                  tab and navigate to the
                  {' '}
                  <code>
                    src
                  </code>
                  {' '}
                  directory. Click on the
                  {' '}
                  <code>
                    config.json
                  </code>
                  {' '}
                  file.

                  <a href={configuration} target="_blank" rel="noopener noreferrer">
                    <img
                      className="img-fluid img-thumbnail"
                      src={configuration}
                      alt="GitHub repository with arrow pointing to config.json file"
                    />
                  </a>

                </li>
                <li>
                  Edit the file and update the following data fields:
                  <ul>
                    <li>
                      <code>title</code>
                      : set this to whatever you want the title of your
                      site to be.
                    </li>
                    <li>
                      <code>subtitle</code>
                      : set this to a subtitle you want to show for
                      your site. It can be the empty string (
                      <code>
                        &quot;&quot;
                      </code>
                      ).
                    </li>
                    <li>
                      <code>doi</code>
                      : set this to the empty string for now (
                      <code>
                        &quot;&quot;
                      </code>
                      ). (More
                      information on adding a DOI is provided in the
                      {' '}
                      <Link to="/instructions/doi">DOI instructions</Link>
                      .)
                    </li>
                    <li>
                      <code>copyright</code>
                      : set this to whatever copyright statement
                      you want for your data files. We recommend using a
                      {' '}
                      <a href="https://creativecommons.org" target="_blank" rel="noopener noreferrer">
                        Creative Commons license
                      </a>
                      .
                    </li>
                    <li>
                      <code>report</code>
                      : if you want people to be able to report any
                      problems they find in your data, you can set this to the
                      issues url for your repository by replacing
                      {' '}
                      <code>perseids-publications</code>
                      {' '}
                      with your GitHub account
                      name. Otherwise set it to the empty string (
                      <code>
                        &quot;&quot;
                      </code>
                      ).
                    </li>
                    <li>
                      <code>github</code>
                      : replace
                      {' '}
                      <code>perseids-publications</code>
                      {' '}
                      with your GitHub account name.
                    </li>
                    <li>
                      <code>twitter</code>
                      : replace this with your own Twitter handle
                      url or else the empty string (
                      <code>
                        &quot;&quot;
                      </code>
                      ).
                    </li>
                  </ul>
                  <a href={configEdit} target="_blank" rel="noopener noreferrer">
                    <img
                      className="img-fluid img-thumbnail"
                      src={configEdit}
                      alt="GitHub visual editor editing package.json"
                    />
                  </a>
                </li>
                <li>
                  Scroll to the bottom of the page to
                  {' '}
                  <code>Commit changes</code>
                  {' '}
                  and enter a message to describe your change to this file.
                  (e.g. something like

                  {' '}
                  <code>
                    Updated site config
                  </code>
                  .)
                </li>
                <li>
                  Make sure the option
                  {' '}
                  <code>
                    Commit directly to the master branch
                  </code>
                  {' '}
                  is selected.

                  <a href={commit} target="_blank" rel="noopener noreferrer">
                    <img
                      className="img-fluid img-thumbnail"
                      src={commit}
                      alt="GitHub page for creating a manual commit with arrow pointing to commit option"
                    />
                  </a>

                </li>
                <li>
                  Go back to the
                  {' '}
                  <code>Actions</code>
                  {' '}
                  tab.
                </li>
                <li>
                  You should see that your build workflow is in progress.

                  <a href={progress} target="_blank" rel="noopener noreferrer">
                    <img
                      className="img-fluid img-thumbnail"
                      src={progress}
                      alt="GitHub build workflow in progress"
                    />
                  </a>
                </li>

                <li>
                  And finally that it succeeds.

                  <a href={success} target="_blank" rel="noopener noreferrer">
                    <img
                      className="img-fluid img-thumbnail"
                      src={success}
                      alt="GitHub build workflow success"
                    />
                  </a>

                </li>
                <li>
                  At this point, your GitHub web page should be published and updated at
                  {' '}
                  <code>
                    https://(youraccountname).github.io
                  </code>
                  .

                  <a href={site} target="_blank" rel="noopener noreferrer">
                    <img
                      className="img-fluid img-thumbnail"
                      src={site}
                      alt="published site based off of the Treebank Template"
                    />
                  </a>

                  So far it is published only with the default treebank files that come with the
                  template. The next steps show you had to add a new file.
                </li>
              </ol>
            </li>
            <li>
              <strong>Update the metadata.</strong>
              <ol>
                <li>
                  Go back to the
                  {' '}
                  <code>
                    Code
                  </code>
                  {' '}
                  tab and click on the
                  {' '}
                  <code>
                    .env
                  </code>
                  {' '}
                  file.
                </li>
                <li>
                  Click the
                  {' '}
                  <code>
                    edit
                  </code>
                  {' '}
                  icon.

                  <a href={env} target="_blank" rel="noopener noreferrer">
                    <img
                      className="img-fluid img-thumbnail"
                      src={env}
                      alt=".env file in the GitHub visual editor"
                    />
                  </a>
                </li>
                <li>
                  Replace
                  {' '}
                  <code>
                    perseids-publications.github.io
                  </code>
                  {' '}
                  with, e.g.,
                  {' '}
                  <code>
                    yourgithubaccount.github.io
                  </code>
                  {' '}
                  after
                  {' '}
                  <code>
                    REACT_APP_IMAGE_URL
                  </code>
                  {' '}
                  and
                  {' '}
                  <code>
                    REACT_APP_URL
                  </code>
                  .
                  That is, if your GitHub user name is &quot;janedoe&quot; you would change
                  {' '}
                  <code>
                    https://perseids-publications.github.io/treebank-template/
                  </code>
                  {' '}
                  to
                  {' '}
                  <code>
                    https://janedoe.github.io/treebank-template/
                  </code>
                  .
                </li>
                <li>
                  Replace the other pieces of metadata with appropriate values:
                  <ul>
                    <li>
                      <code>REACT_APP_SITE_NAME</code>
                      : the larger site that this page is a part of. You can keep it as
                      The Perseids Project or change it to the name of your project.
                    </li>
                    <li>
                      <code>REACT_APP_TITLE</code>
                      : change this to the title of your site
                      (it is a good idea to make this the same as the title in
                      {' '}
                      <code>config.json</code>
                      ).
                    </li>
                    <li>
                      <code>REACT_APP_DESCRIPTION</code>
                      : set this to a one or two sentence description of your project.
                    </li>
                  </ul>
                </li>
                <li>
                  Scroll to the bottom of the page to
                  {' '}
                  <code>
                    Commit changes
                  </code>
                  {' '}
                  and enter a message to describe your
                  change to this file (e.g. something like &quot;Updated metadata&quot;).
                </li>
                <li>
                  Click
                  {' '}
                  <code>
                    Commit changes
                  </code>
                  .
                </li>
              </ol>
            </li>
            <li>
              <strong>Add a new file to your repository.</strong>
              <ol>
                <li>
                  Return to the
                  {' '}
                  <code>Code</code>
                  {' '}
                  tab of the repository in GitHub and navigate to the
                  {' '}
                  <code>public/xml</code>
                  {' '}
                  directory.
                </li>
                <li>
                  Click the
                  {' '}
                  <code>Upload</code>
                  {' '}
                  button.
                  <a href={upload} target="_blank" rel="noopener noreferrer">
                    <img
                      className="img-fluid img-thumbnail"
                      src={upload}
                      alt="arrow pointing to upload files button on GitHub"
                    />
                  </a>
                </li>
                <li>Upload your file.</li>
                <li>
                  Navigate to the
                  {' '}
                  <code>src</code>
                  {' '}
                  directory of your repository.
                </li>
                <li>
                  Edit the
                  {' '}
                  <code>config.json</code>
                  {' '}
                  file again.
                </li>
                <li>
                  You need to add a new entry for the file you just added to the the
                  {' '}
                  <code>publications</code>
                  {' '}
                  section of the file. For each file added you need to define
                  the following fields:
                  <ul>
                    <li>
                      <code>path</code>
                      : the virtual path for the files associated with
                      the treebank publication - this can be anything
                      you want, but avoid spaces and special characters.
                    </li>
                    <li>
                      <code>author</code>
                      : this should be set to be the author of the
                      text that is the subject of the treebank publication.
                    </li>
                    <li>
                      <code>work</code>
                      : this should identify the text that is the subject
                      of the treebank publication.
                    </li>
                    <li>
                      <code>editors</code>
                      : here you can list anybody who contributed to
                      the treebank publication.
                    </li>
                    <li>
                      <code>sections</code>
                      : each treebank publication can be composed of
                      one or more files (e.g. a very large text might be broken into
                      chapters). In our example so far, we just have a publication
                      made up of a single file. For each file added to the parent
                      publication, we need a separate entry made up of the following fields:
                      <ul>
                        <li>
                          <code>locus</code>
                          : this is the text that will be shown as the link to the file
                          on the site. Normally this is set to the range of sentences in the tree
                          but it can be any text that makes sense for your data.
                        </li>
                        <li>
                          <code>path</code>
                          : the virtual path for the file. It can be anything you
                          choose. A normal practice is to use the filename without the
                          {' '}
                          <code>
                            .xml
                          </code>
                          {' '}
                          extension.
                          Avoid spaces and special characters.
                        </li>
                        <li>
                          <code>xml</code>
                          : this is the actual path to the file under the
                          {' '}
                          <code>public/xml</code>
                          {' '}
                          directory (excluding the
                          {' '}
                          <code>public/xml/</code>
                          {' '}
                          part of the path).
                        </li>
                        <li>
                          <code>chunks</code>
                          : this contains two sub fields.
                          <ul>
                            <li>
                              <code>start</code>
                              : the starting sentence number in your file.
                            </li>
                            <li>
                              <code>end</code>
                              : the ending sentence number in your file.
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </li>
                  </ul>

                  <a href={myTreesConfig} target="_blank" rel="noopener noreferrer">
                    <img
                      className="img-fluid img-thumbnail"
                      src={myTreesConfig}
                      alt="GitHub visual editor editing src/config.json"
                    />
                  </a>

                </li>
                <li>
                  It&apos;s a good idea to make sure the file parses as valid JSON prior
                  to saving it. The JSON validator at
                  {' '}
                  <a href="https://jsonlint.com/" target="_blank" rel="noopener noreferrer">https://jsonlint.com</a>
                  {' '}
                  is a good resource to use for that.
                </li>
                <li>Save and commit your changes to the master branch.</li>
                <li>
                  After the build succeeds, you should now see your new tree publication added to
                  the site.
                  <a href={myTreesSite} target="_blank" rel="noopener noreferrer">
                    <img
                      className="img-fluid img-thumbnail"
                      src={myTreesSite}
                      alt="published site with an arrow pointing to newly added section"
                    />
                  </a>
                </li>
                <li>
                  Once you have added your own data files to the repository, you may wish to
                  register a
                  {' '}
                  <a href="https://doi.org" target="_blank" rel="noopener noreferrer">DOI</a>
                  {' '}
                  as a
                  a persistent identifier for your data so that it can be easily
                  cited. This DOI can then be listed on the home page of the repository.
                  See the
                  {' '}
                  <Link to="/instructions/doi">DOI</Link>
                  {' '}
                  instructions for details.
                </li>
              </ol>
            </li>
          </ol>
          <p>
            You now have the basics of how to get started with creating a GitHub based publication
            of your treebank data using the Perseids Publications treebank template. From here you
            can proceed to remove the sample data from the publication by removing the files from
            the
            {' '}
            <code>public/xml</code>
            {' '}
            directory and removing the
            corresponding entries in the
            {' '}
            <code>src/config.json</code>
            {' '}
            file (doing so requires a local clone of your
            GitHub respository). You can also add additional files and publications,
            and
            {' '}
            <a href={`${process.env.PUBLIC_URL}/examples/alpheios-integration`} target="_blank" rel="noopener noreferrer">
              integrate it with Alpheios
            </a>
            .
          </p>
          <p>
            The Perseids Treebank Template code is regularly updated with new features.
            We have created a workflow that makes it easy to pull the updates into your repository.
            See the
            {' '}
            <Link to="/instructions/updating">updating</Link>
            {' '}
            instructions for details.
          </p>
          For additional information see also the repository&apos;s
          {' '}
          <code>README.md</code>
          {' '}
          file and the
          {' '}
          <code>docs/Config.md</code>
          {' '}
          file.
        </div>
      </div>
    </div>
  </>
);

GettingStarted.propTypes = {
  config: configType.isRequired,
};

export default GettingStarted;
