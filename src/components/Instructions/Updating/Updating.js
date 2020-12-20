import React from 'react';

import styles from '../Instructions.module.css';

import actions from './actions.png';
import update from './update.png';
import runWorkflow from './run-workflow.png';

import { configType } from '../../../lib/types';

import InstructionsHeader from '../InstructionsHeader';

const Updating = ({ config }) => (
  <>
    <InstructionsHeader config={config} title="Updating" />
    <div className={`container pt-3 pb-4 ${styles.instructions}`}>
      <div className="row">
        <div className="col">
          <h2>Updating the Treebank Template code</h2>
          <p>
            In order to use new features introduced in versions of
            {' '}
            <a
              href="https://github.com/perseids-publications/treebank-template"
              target="_blank"
              rel="noopener noreferrer"
            >
              perseids-publications/treebank-template
            </a>
            {' '}
            published after your own fork was created,
            you will need to update the underlying Treebank Template code.
          </p>

          <p>
            This can be done through GitHub&apos;s interface by following the steps below:
          </p>

          <ol>
            <li>
              Click on the
              {' '}
              <code>Actions</code>
              {' '}
              tab.

              <a
                href={actions}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="img-fluid img-thumbnail"
                  src={actions}
                  alt="GitHub repository with arrow pointing to actions tab"
                />
              </a>
            </li>
            <li>
              Click on the
              {' '}
              <code>update</code>
              {' '}
              workflow from the workflow list.

              <a
                href={update}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="img-fluid img-thumbnail"
                  src={update}
                  alt="GitHub repository action tab with arrow pointing to update action"
                />
              </a>
            </li>
            <li>
              Click on the
              {' '}
              <code>Run workflow</code>
              {' '}
              drop-down list and then click on the green
              {' '}
              <code>Run workflow</code>
              {' '}
              button.

              <a
                href={runWorkflow}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="img-fluid img-thumbnail"
                  src={runWorkflow}
                  alt="Update workflow page with arrow pointing to the run workflow button"
                />
              </a>
              {' '}

              The update workflow will now run.
              When it is complete, the code will be up to date with
              {' '}

              <a
                href="https://github.com/perseids-publications/treebank-template"
                target="_blank"
                rel="noopener noreferrer"
              >
                perseids-publications/treebank-template
              </a>
              .
            </li>
          </ol>
        </div>
      </div>
    </div>
  </>
);

Updating.propTypes = {
  config: configType.isRequired,
};

export default Updating;
