import * as yup from 'yup';

const schema = yup.string().url();

const validate = (url, feedsList) => {
  if (feedsList.includes(url)) {
    return 'notOneOf';
  }
  try {
    schema.validateSync(url);
    return '';
  } catch (e) {
    return 'url';
  }
};

export default validate;
