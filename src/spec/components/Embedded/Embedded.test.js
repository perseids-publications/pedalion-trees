import React from 'react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render, waitForElementToBeRemoved } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import config from '../../config.test.json';
import treebanks from '../../treebanks.test.json';

import Embedded from '../../../components/Embedded';

jest.mock('treebank-react');
jest.mock('alpheios-messaging');

const server = setupServer(
  rest.get(`${process.env.PUBLIC_URL}/xml/lysias-1-1-50.xml`, (req, res, ctx) => (
    res(ctx.delay(10), ctx.text(treebanks.lysias))
  )),
);

let sentenceCallbackValue;

beforeAll(() => server.listen());
beforeAll(() => {
  sentenceCallbackValue = global.sentenceCallbackValue;
  global.sentenceCallbackValue = {
    treebank: { $: {} },
    configuration: { deconstructPostag: () => {} },
  };
});
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
afterAll(() => {
  global.sentenceCallbackValue = sentenceCallbackValue;
});

it('renders an embedded publication', async () => {
  const component = (
    <MemoryRouter initialEntries={['/embed/on-the-murder-of-eratosthenes-1-50/1']}>
      <Embedded config={config} />
    </MemoryRouter>
  );
  const { container, queryByText } = render(component);

  expect(container).toMatchSnapshot();

  await waitForElementToBeRemoved(() => queryByText('Loading...'));

  expect(container).toMatchSnapshot();
});

it('the API supports gotoSentence', async () => {
  const component = (
    <MemoryRouter initialEntries={['/embed/on-the-murder-of-eratosthenes-1-50/1']}>
      <Embedded config={config} />
    </MemoryRouter>
  );
  const { container, queryByText } = render(component);
  const request = { ID: 'test', body: { gotoSentence: { sentenceId: '5' } } };

  await waitForElementToBeRemoved(() => queryByText('Loading...'));
  global.sendRequestToMock(request, () => {});

  expect(container).toMatchSnapshot();
});

it('the API supports gotoSentence with highlighted words', async () => {
  const component = (
    <MemoryRouter initialEntries={['/embed/on-the-murder-of-eratosthenes-1-50/1']}>
      <Embedded config={config} />
    </MemoryRouter>
  );
  const { container, queryByText } = render(component);
  const request = { ID: 'test', body: { gotoSentence: { sentenceId: '5', wordIds: ['12'] } } };

  await waitForElementToBeRemoved(() => queryByText('Loading...'));
  global.sendRequestToMock(request, () => {});

  expect(container).toMatchSnapshot();
});

it('the API performs a no-op for refreshView', async () => {
  const component = (
    <MemoryRouter initialEntries={['/embed/on-the-murder-of-eratosthenes-1-50/1']}>
      <Embedded config={config} />
    </MemoryRouter>
  );
  const { container, queryByText } = render(component);
  const request = { ID: 'test', body: { refreshView: true } };

  await waitForElementToBeRemoved(() => queryByText('Loading...'));
  global.sendRequestToMock(request, () => {});

  expect(container).toMatchSnapshot();
});

it('renders 404 when publication not found', () => {
  const component = (
    <MemoryRouter initialEntries={['/embed/unknown']}>
      <Embedded config={config} />
    </MemoryRouter>
  );
  const { container } = render(component);

  expect(container).toMatchSnapshot();
});
