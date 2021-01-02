import i18next from 'i18next';
import { has } from 'lodash';
import * as yup from 'yup';

const schema = yup.string().url();

const validate = (url, feedsList) => {
  console.log(`VALIDATOR---URL:${url}FEEDSLIST:${feedsList}`);
  if (feedsList.includes(url)) {
    return 'notOneOf';
  }
  try {
    console.log('validating');
    schema.validateSync(url);
    return '';
  } catch (e) {
    console.log(`validation error : ${e.message}`);
    return 'url';
  }
};

export default validate;
