import queryString from 'query-string';

const params = [
  { name: 'w', type: 'array' },
  { name: 'config', type: 'string', link: true },
];

const convertToType = (value, type) => {
  if (type === 'array' && !Array.isArray(value)) {
    return [value];
  }

  return value;
};

export const parse = (search) => {
  const parsed = queryString.parse(search, { arrayFormat: 'comma' });
  const result = {};

  params.forEach(({ name, type }) => {
    if (Object.prototype.hasOwnProperty.call(parsed, name)) {
      result[name] = convertToType(parsed[name], type);
    }
  });

  return result;
};

export const linkParams = (search) => {
  const additionalArgs = parse(search);
  const result = {};

  params.forEach(({ name, type, link }) => {
    if (link && Object.prototype.hasOwnProperty.call(additionalArgs, name)) {
      result[name] = convertToType(additionalArgs[name], type);
    }
  });

  return result;
};

export const buildQueryString = (queryParams) => (
  queryString.stringify(queryParams, { arrayFormat: 'comma' })
);
