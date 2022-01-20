// Legacy code to replicate
// https://github.com/alpheios-project/arethusa/blob/0a82a2ad9cc7468ea781bfa023a1dddbd77130c6/app/js/arethusa.core/services/api.js#L59

const getLang = (treebank) => {
  try {
    return treebank.$['xml:lang'];
  } catch {
    return '';
  }
};

const getForm = (word) => {
  try {
    return word.$.form;
  } catch {
    return '';
  }
};

const getLemma = (word) => {
  try {
    return word.$.lemma;
  } catch {
    return '';
  }
};

const getSentence = (treebank, sentenceId) => {
  try {
    return treebank.sentence.find(
      ({ $: { id } }) => id === sentenceId,
    );
  } catch {
    return {};
  }
};

const getMood = (deconstructed) => {
  for (let ii = 0; ii < deconstructed.length; ii += 1) {
    if (deconstructed[ii][0].key === 'mood') {
      return deconstructed[ii][1].long;
    }
  }

  return '';
};

// From https://github.com/alpheios-project/arethusa/blob/0a82a2ad9cc7468ea781bfa023a1dddbd77130c6/app/js/arethusa.core/factories/api_outputter.js#L15
const attributeToAlpheios = (key, long, mood) => {
  let newKey = key;
  let newLong = long;

  if (newKey === 'pos') {
    newKey = 'pofs';

    if (newLong === 'verb' && mood === 'participle') {
      newLong = 'verb participle';
    }

    if (newLong === 'adposition') {
      newLong = 'preposition';
    }
  }

  if (newKey === 'degree') {
    newKey = 'comp';
  }

  if (newKey === 'tense' && newLong === 'plusquamperfect') {
    newLong = 'pluperfect';
  }

  if (newKey === 'voice' && newLong === 'medio-passive') {
    newLong = 'mediopassive';
  }

  return [
    newKey,
    { $: newLong },
  ];
};

const convertPostag = ({
  deconstructed, treebank, word,
}) => {
  const lang = getLang(treebank);
  const form = getForm(word);
  const lemma = getLemma(word);
  const mood = getMood(deconstructed);

  const infl = {
    term: { form: { $: form } },
  };

  deconstructed.forEach(([{ key }, { long }]) => {
    const [k, v] = attributeToAlpheios(key, long, mood);

    infl[k] = v;
  });

  return {
    RDF: {
      Annotation: {
        about: '',
        creator: {
          Agent: { about: '' },
        },
        created: { $: '' },
        rights: { $: '' },
        hasTarget: {
          Description: { about: '' },
        },
        hasBody: { resource: '' },
        Body: {
          about: '',
          type: { resource: 'cnt:ContentAsXML' },
          rest: {
            entry: {
              dict: {
                hdwd: {
                  lang,
                  $: lemma,
                },
              },
              infl,
            },
          },
        },
      },
    },
  };
};

const alpheiosAnnotation = ({
  treebank, configuration, sentenceId, wordId,
}) => {
  try {
    const sentenceIdString = String(sentenceId);
    const sentence = getSentence(treebank.treebank, sentenceIdString);

    const wordIdString = String(wordId);
    const word = sentence.word.find(({ $: { id } }) => id === wordIdString);
    const deconstructed = configuration.deconstructPostag(word.$.postag);

    return convertPostag({ deconstructed, treebank: treebank.treebank, word });
  } catch {
    return {};
  }
};

// Unicode normalize and strip accents
const normalize = (text) => (
  text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
);

// Simplified version of:
// https://github.com/alpheios-project/arethusa/blob/0a82a2ad9cc7468ea781bfa023a1dddbd77130c6/app/js/arethusa.search/services/search.js#L168
// This code will work for most cases where the above works. It will also match
// words that differ only by diacritics.
// However, there are some corner cases where it will not return the same
// results. Given the significant reduction of complexity, this is an
// acceptable trade-off.
const alpheiosFindWord = ({
  treebank, sentenceId, word, prefix, suffix,
}) => {
  try {
    const sentenceIdString = String(sentenceId);
    const wordNormalized = normalize(word);
    const prefixNormalized = normalize(prefix || '');
    const suffixNormalized = normalize(suffix || '');
    const sentence = getSentence(treebank.treebank, sentenceIdString);

    const ids = [];

    for (let ii = 0; ii < sentence.word.length; ii += 1) {
      const test = normalize(sentence.word[ii].$.form);

      if (test !== wordNormalized) {
        continue;
      }

      if (prefix !== '') {
        if (ii <= 0) {
          continue;
        }

        const prefixTest = normalize(sentence.word[ii - 1].$.form);

        if (prefixTest !== prefixNormalized) {
          continue;
        }
      }

      if (suffix !== '') {
        if (ii >= sentence.word.length - 1) {
          continue;
        }

        const suffixTest = normalize(sentence.word[ii + 1].$.form);

        if (suffixTest !== suffixNormalized) {
          continue;
        }
      }

      ids.push(sentence.word[ii].$.id);
    }

    return ids;
  } catch {
    return [];
  }
};

export {
  alpheiosAnnotation,
  alpheiosFindWord,
};
