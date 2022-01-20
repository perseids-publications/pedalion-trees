import React from 'react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render, waitForElementToBeRemoved } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import config from '../../config.test.json';
import treebanks from '../../treebanks.test.json';

import Page from '../../../components/Page';

jest.mock('treebank-react');

const server = setupServer(
  rest.get(`${process.env.PUBLIC_URL}/xml/lysias-1-1-50.xml`, (req, res, ctx) => (
    res(ctx.delay(10), ctx.text(treebanks.lysias))
  )),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('renders the main page', () => {
  const component = (
    <MemoryRouter initialEntries={['/']}>
      <Page config={config} />
    </MemoryRouter>
  );
  const { container } = render(component);

  expect(container).toMatchSnapshot();
});

it('renders the main page with markdown in the subtitle', () => {
  const { subtitle } = config;
  config.subtitle = 'Lorem ipsum [dolor sit amet](https://www.perseids.org), consectetur adipiscing elit';

  const component = (
    <MemoryRouter initialEntries={['/']}>
      <Page config={config} />
    </MemoryRouter>
  );
  const { container } = render(component);

  expect(container).toMatchSnapshot();

  config.subtitle = subtitle;
});

it('does not render collections that are hidden', () => {
  config.collections[1].hidden = true;

  const component = (
    <MemoryRouter initialEntries={['/']}>
      <Page config={config} />
    </MemoryRouter>
  );
  const { container } = render(component);

  expect(container).toMatchSnapshot();

  delete config.collections[1].hidden;
});

it('renders a link to the full publication when publication is collapsed', () => {
  config.collections[1].publications[0].collapsed = true;

  const component = (
    <MemoryRouter initialEntries={['/']}>
      <Page config={config} />
    </MemoryRouter>
  );
  const { container } = render(component);

  expect(container).toMatchSnapshot();

  delete config.collections[1].publications[0].collapsed;
});

it('does not render a publication that is hidden', () => {
  config.collections[1].publications[1].hidden = true;

  const component = (
    <MemoryRouter initialEntries={['/']}>
      <Page config={config} />
    </MemoryRouter>
  );
  const { container } = render(component);

  expect(container).toMatchSnapshot();

  delete config.collections[1].publications[1].hidden;
});

it('renders the footer with a doi', () => {
  config.doi = 'https://www.example.com/doi';

  const component = (
    <MemoryRouter initialEntries={['/']}>
      <Page config={config} />
    </MemoryRouter>
  );
  const { container } = render(component);

  expect(container).toMatchSnapshot();

  delete config.doi;
});

it('renders a publication', async () => {
  const component = (
    <MemoryRouter initialEntries={['/on-the-murder-of-eratosthenes-1-50/1']}>
      <Page config={config} />
    </MemoryRouter>
  );
  const { container, queryByText } = render(component);

  expect(container).toMatchSnapshot();

  await waitForElementToBeRemoved(() => queryByText('Loading...'));

  expect(container).toMatchSnapshot();
});

it('renders a publication with a subdoc', async () => {
  const { sentenceCallbackValue } = global;
  global.sentenceCallbackValue = { sentence: { $: { subdoc: 'example-subdoc' } } };

  const component = (
    <MemoryRouter initialEntries={['/on-the-murder-of-eratosthenes-1-50/1']}>
      <Page config={config} />
    </MemoryRouter>
  );
  const { container, findByText, queryByText } = render(component);

  await waitForElementToBeRemoved(() => queryByText('Loading...'));
  await findByText('example-subdoc');

  expect(container).toMatchSnapshot();

  global.sentenceCallbackValue = sentenceCallbackValue;
});

it('renders a publication with highlighted words', async () => {
  const component = (
    <MemoryRouter initialEntries={['/on-the-murder-of-eratosthenes-1-50/1?w=2,3']}>
      <Page config={config} />
    </MemoryRouter>
  );
  const { container, queryByText } = render(component);

  await waitForElementToBeRemoved(() => queryByText('Loading...'));

  expect(container).toMatchSnapshot();
});

it('renders a publication with markdown', async () => {
  const component = (
    <MemoryRouter initialEntries={['/on-the-crown-1-50/1']}>
      <Page config={config} />
    </MemoryRouter>
  );
  const { container, queryByText } = render(component);

  await waitForElementToBeRemoved(() => queryByText('Loading...'));

  expect(container).toMatchSnapshot();
});

it('renders a publication with a numbers array', async () => {
  const component = (
    <MemoryRouter initialEntries={['/philippic-1-51/1']}>
      <Page config={config} />
    </MemoryRouter>
  );
  const { container, queryByText } = render(component);

  await waitForElementToBeRemoved(() => queryByText('Loading...'));

  expect(container).toMatchSnapshot();
});

it('renders a publication group', () => {
  const component = (
    <MemoryRouter initialEntries={['/on-the-murder-of-eratosthenes']}>
      <Page config={config} />
    </MemoryRouter>
  );
  const { container } = render(component);

  expect(container).toMatchSnapshot();
});

it('renders a publication group when a publication is collapsed', () => {
  config.collections[1].publications[0].collapsed = true;

  const component = (
    <MemoryRouter initialEntries={['/on-the-murder-of-eratosthenes']}>
      <Page config={config} />
    </MemoryRouter>
  );
  const { container } = render(component);

  expect(container).toMatchSnapshot();

  delete config.collections[1].publications[0].collapsed;
});

it('renders 404 when publication not found', () => {
  const component = (
    <MemoryRouter initialEntries={['/unknown']}>
      <Page config={config} />
    </MemoryRouter>
  );
  const { container } = render(component);

  expect(container).toMatchSnapshot();
});

it('renders 404 when publication and chunk not found', () => {
  const component = (
    <MemoryRouter initialEntries={['/unknown/1']}>
      <Page config={config} />
    </MemoryRouter>
  );
  const { container } = render(component);

  expect(container).toMatchSnapshot();
});

it('renders 404 when route does not match known route', () => {
  const component = (
    <MemoryRouter initialEntries={['/a/b/c/d']}>
      <Page config={config} />
    </MemoryRouter>
  );
  const { container } = render(component);

  expect(container).toMatchSnapshot();
});

it('renders no logo when logo set to ""', () => {
  config.logo = '';

  const component = (
    <MemoryRouter initialEntries={['/unknown/1']}>
      <Page config={config} />
    </MemoryRouter>
  );
  const { container } = render(component);

  expect(container).toMatchSnapshot();

  delete config.logo;
});

it('renders a custom link', () => {
  config.link = 'https://www.google.com';

  const component = (
    <MemoryRouter initialEntries={['/unknown/1']}>
      <Page config={config} />
    </MemoryRouter>
  );
  const { container } = render(component);

  expect(container).toMatchSnapshot();

  delete config.link;
});

it('renders the getting started page', () => {
  const component = (
    <MemoryRouter initialEntries={['/instructions/getting-started']}>
      <Page config={config} />
    </MemoryRouter>
  );
  const { container } = render(component);

  expect(container).toMatchSnapshot();
});

it('renders the doi page', () => {
  const component = (
    <MemoryRouter initialEntries={['/instructions/doi']}>
      <Page config={config} />
    </MemoryRouter>
  );
  const { container } = render(component);

  expect(container).toMatchSnapshot();
});

it('renders the update page', () => {
  const component = (
    <MemoryRouter initialEntries={['/instructions/updating']}>
      <Page config={config} />
    </MemoryRouter>
  );
  const { container } = render(component);

  expect(container).toMatchSnapshot();
});

it('renders 404 when no instruction route matches', () => {
  const component = (
    <MemoryRouter initialEntries={['/instructions/a/b/c']}>
      <Page config={config} />
    </MemoryRouter>
  );
  const { container } = render(component);

  expect(container).toMatchSnapshot();
});
