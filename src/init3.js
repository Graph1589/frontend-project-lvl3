// еще две ошибки?
// ***
// разнести по модулям - вотчер
// сделать рендер ошибок и успехов через соответствующие функции
// подключение i18next в шаблон и в вывод ошибок
// организовать обновление rss потоков  и рендер после обновления

import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
// import _, { isEmpty } from 'lodash';
import resources from './locales';
import { renderLayout, renderInputError, renderFeedError } from './renderers';
import validate from './validator';
import parseXML from './parser';
// import view form './view';


const proxy = 'https://cors-anywhere.herokuapp.com/';

export default () => {
  // стейт
  const state = {
    form: {
      processState: 'filling',
      injectedUrl: '',
      valid: true,
      inputError: '',
      feedError: '',
    },
    layout: {
      feeds: [],
      posts: [],
    },
  };

  // константы
  const form = document.querySelector('[class="rss-form form-inline"]');
  const urlField = document.querySelector('[class="form-control"]');
  const submitButton = document.querySelector('[class="btn btn-primary"]');

  const feedbackSuccess = document.querySelector('[class="feedback text-success"]');
  // возможно, здесь также понадобится данжер и succes alert

  // стейт хендлер
  const processStateHandler = (processState) => {
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
        // state.form.injectedUrl = '';
        urlField.value = '';
        // здесь, вероятно, вся форма исчезнет при удачном добавлении фида
        // в таком случае нужно будет переопределить контейнер на фидбек под формой
        break;
      default:
        throw new Error(`Unknown state: ${processState}`);
    }
  };

  // вотчер (позже вынести в модуль)
  /*
  const watchedState = view(state);
  */

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form.processState':
        processStateHandler(value);
        break;
      case 'form.valid':
        submitButton.disabled = !value;
        break;
      case 'form.inputError':
        renderInputError(value);
        break;
      case 'form.feedError':
        console.log('feed error already in watcher');
        renderFeedError(value);
        break;
      case 'layout.posts':
        console.log('watched state, state.posts changed');
        renderLayout(state);
        break;
      default:
        break;
    }
  });

  const getFeedsList = () => watchedState.layout.feeds.map((feed) => feed.url);

  const updateValidationState = () => {
    // здесь валидация и изменение стейта валидно и ошибки, если есть
    const error = validate(watchedState.form.injectedUrl, getFeedsList());
    watchedState.form.valid = (error === '');
    console.log(`updatevalidationstate-ERROR-${error}`);
    watchedState.form.inputError = error;
  };

  const addRSS = ({
    url, streamTitle, streamDescription, posts,
  }) => {
    console.log('adding rss'); // сюда проходит
    console.log(state);
    watchedState.layout.feeds = [{ url, streamTitle, streamDescription }, ...state.layout.feeds];
    watchedState.layout.posts = posts.concat(state.layout.posts);
    console.log(state);
  };

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
    axios.get(`${proxy}${urlField.value}`)
      .then((response) => {
        // console.log(response.request.response);
        const parsedRSS = parseXML(response.request.response, urlField.value);
        console.log(`response.data = ${response.data}`);
        addRSS(parsedRSS);
        // console.log(parsedRSS);
        watchedState.form.processState = 'finished';
        // здесь очевидно должен быть рендер;
        // console.log(parsedRSS);
        // console.log(parseXML(response.request.response).querySelector('title'));
      })
      .catch(() => {
        console.log('catch in GET');
        console.log(`BEFORE watchedState.form.feedError = ${watchedState.form.feedError}`);
        watchedState.form.feedError = 'network';
        console.log(`AFTER watchedState.form.feedError = ${watchedState.form.feedError}`);
      });
  });

  i18next.init({
    lng: 'en',
    debug: false,
    resources,
  }).then((t) => {
    renderLayout(state, t);
  });
};
