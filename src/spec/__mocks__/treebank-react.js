import React, { useEffect } from 'react';

let treebank;
let id;
let highlight;

const hash = (string) => (
  string.split('').reduce(
    (m, n) => {
      // eslint-disable-next-line no-bitwise
      const h = ((m << 5) - m) + n.charCodeAt(0);
      // eslint-disable-next-line no-bitwise
      return h & h;
    },
    0,
  )
);

const mockedComponent = (string) => (
  () => (
    <div data-treebank={treebank} data-id={id} data-highlight={highlight}>
      {string}
    </div>
  )
);

const Treebank = ({ treebank: tb, children }) => {
  treebank = hash(tb);

  return (
    <>{children}</>
  );
};

const Sentence = ({
  id: i, highlight: hl, callback, children,
}) => {
  id = i;
  highlight = hl;

  useEffect(() => {
    if (callback && global.sentenceCallbackValue) {
      callback(global.sentenceCallbackValue);
    }
  }, [i]);

  return (
    <>{children}</>
  );
};

const Collapse = ({ title, children }) => (
  <div data-collapse-title={title}>{children}</div>
);

const Text = mockedComponent('Text');
const Graph = mockedComponent('Graph');
const PartOfSpeech = mockedComponent('PartOfSpeech');
const Xml = mockedComponent('Xml');

export {
  Treebank,
  Sentence,
  Text,
  Graph,
  PartOfSpeech,
  Xml,
  Collapse,
};
