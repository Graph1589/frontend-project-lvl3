import * as yup from 'yup';

const schema = yup.string().url();

const validate = (url, feedsList) => {
  console.log('//');
  console.log(url);
  console.log(feedsList);
  console.log('//');
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
