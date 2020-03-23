import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';

import Embedded from './Embedded';
import TreebankService from '../TreebankService';

import config from './config.test.json';

it('renders an embedded publication', () => {
  const component = (
    <MemoryRouter initialEntries={['/embed/on-the-murder-of-eratosthenes-1-50/1']}>
      <Embedded config={config} />
    </MemoryRouter>
  );
  const tree = renderer.create(component).toJSON();

  expect(tree).toMatchSnapshot();
});

it('provides an API to communicate with an embedded publication', () => {
  const component = (
    <MemoryRouter initialEntries={['/embed/on-the-murder-of-eratosthenes-1-50/1']}>
      <Embedded config={config} />
    </MemoryRouter>
  );
  const tree = renderer.create(component);
  const { instance: { messageHandler } } = tree.root.findByType(TreebankService);

  messageHandler(
    { ID: 'test', body: { gotoSentence: { sentenceId: '5' } } },
    () => {},
  );

  expect(tree).toMatchSnapshot();
});

it('renders 404 when publication not found', () => {
  const component = (
    <MemoryRouter initialEntries={['/embed/unknown']}>
      <Embedded config={config} />
    </MemoryRouter>
  );
  const tree = renderer.create(component).toJSON();

  expect(tree).toMatchSnapshot();
});
