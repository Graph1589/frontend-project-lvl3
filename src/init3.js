
// нужна так же проверка на повторы; !!!!!!!!

import onChange from 'on-change';
import axios from 'axios';
import * as yup from 'yup';
import _, { isEmpty } from 'lodash';

const schema = yup.string().url();

const proxy = axios.create({
  baseURL: 'https://cors-anywhere.herokuapp.com/',
});

const validate = (url) => {
  try {
    schema.validateSync(url);
    console.log('1');
    return {};
  } catch (e) {
    return e.message;
  }
};

const parseXML = (feedString, url) => {
  const parser = new DOMParser();
  const feedDocument = parser.parseFromString(feedString, 'text/html');
  const streamTitle = feedDocument.querySelector('title').textContent;
  const streamDescription = feedDocument.querySelector('description').textContent;
  const posts = [...feedDocument.querySelectorAll('item')].map((item) => {
    console.log(item);
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').nextSibling.textContent;
    const description = item.querySelector('description').textContent;
    const pubdate = item.querySelector('pubdate').textContent;
    const own = url;
    return {
      title, link, description, pubdate, own,
    };
  });
  // заголовок и описание вытаскиваются нормально, но посты при итерации пустые
  //
  // console.log([...feedDocument.querySelectorAll('item')]);
  // console.log(title.textContent);
  // console.log(description.textContent);
  return {
    url, streamTitle, streamDescription, posts,
  };
  // posts: [ feedDocument.querySelectorAll('')],
  // пока ничего не возвращается + парсер нужно вынести в модуль
};

const updateValidationState = (watchedState) => {
  // здесь валидация и изменение стейта валидно и ошибки, если есть
  const errors = validate(watchedState.form.injectedUrl);
  watchedState.form.valid = _.isEqual(errors, {});
  watchedState.form.errors = errors;
};

const renderErrors = (feedbackDanger, value) => {
  // отражение ошибок на html файле
  feedbackDanger.textContent = !isEmpty(value) ? value : '';
  // продумать аргументы функции с учетом того, что у меня 1 поле ввода
};

const renderSuccess = (feedbackSuccess, value) => {
  feedbackSuccess.textContent = !isEmpty(value) ? value : '';
};

export default () => {
  // стейт
  const state = {
    form: {
      processState: 'filling',
      injectedUrl: '',
      valid: true,
      errors: {},
    },
    feeds: [],
    posts: {},
  };

  // константы
  const form = document.querySelector('[class="rss-form form-inline"]');
  const urlField = document.querySelector('[class="form-control"]');
  const submitButton = document.querySelector('[class="btn btn-primary"]');

  const feedbackDanger = document.querySelector('[class="feedback text-danger"]');
  const feedbackSuccess = document.querySelector('[class="feedback text-success"]');
  // возможно, здесь также понадобится данжер и succes alert

  const addRSS = (parsedRSS) => {

  };


  // стейт хендлер
  const procesStateHandler = (processState) => {
    console.log(processState);
    switch (processState) {
      case 'failed':
        submitButton.disabled = false;
        // TODO render error
        break;
      case 'filling':
        submitButton.disabled = false;
        break;
      case 'sending':
        submitButton.disabled = true;
        break;
      case 'finished':
        feedbackSuccess.textContent = 'feed has been added';
        urlField.value = '';
        // здесь, вероятно, вся форма исчезнет при удачном добавлении фида
        // в таком случае нужно будет переопределить контейнер на фидбек под формой
        break;
      default:
        throw new Error(`Unknown state: ${processState}`);
    }
  };

  // вотчер (позже вынести в модуль)
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form.processState':
        procesStateHandler(value);
        break;
      case 'form.valid':
        submitButton.disabled = !value;
        break;
      case 'form.errors':
        feedbackDanger.textContent = !isEmpty(value) ? value : '';
        break;
      default:
        break;
    }
  });

  // евент листнер на ввод
  urlField.addEventListener('input', (e) => {
    feedbackSuccess.textContent = '';
    watchedState.form.processState = 'filling';
    watchedState.form.injectedUrl = e.target.value;
    updateValidationState(watchedState);
  });

  // евент листнер на сабмит
  // const promise = new Promise();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('sending');
    watchedState.form.processState = 'sending';
    // тут промис с запросом на прокси / или нет?
    proxy.get(`${urlField.value}`)
      .then((response) => {
        // console.log(response.request.response);
        const parsedRSS = parseXML(response.request.response, urlField.value);
        addRSS(parsedRSS);
        console.log(parsedRSS);
        watchedState.form.processState = 'finished';
        // здесь очевидно должен быть рендер;
        // console.log(parsedRSS);
        // console.log(parseXML(response.request.response).querySelector('title'));
      })
      .catch((error) => {
        console.log(error);
      });
  });
};
