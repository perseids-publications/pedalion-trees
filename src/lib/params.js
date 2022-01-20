import queryString from 'query-string';

const params = [
  { name: 'w', type: 'array' },
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

export const buildQueryString = (queryParams) => (
  queryString.stringify(queryParams, { arrayFormat: 'comma' })
);
