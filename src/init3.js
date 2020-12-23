// разобраться с CORS и загрузкой потоков с новостных сайтов
// ***
// довести до ума отчистку перед рендером. Возможно рекурсия
// разнести по модулям - вотчер, рендеры
// нужна так же проверка на повторы; !!!!!!!!
// сделать рендер ошибок и успехов через соответствующие функции
// отрисовка фидов и постов
// подключение i18next в шаблон и в вывод ошибок
// организовать обновление rss потоков  и рендер после обновления

import onChange from 'on-change';
import axios from 'axios';
import * as yup from 'yup';
import _, { isEmpty, remove } from 'lodash';

const schema = yup.string().url();

const proxy = 'https://cors-anywhere.herokuapp.com/';

const validate = (url) => {
  try {
    console.log('validating');
    schema.validateSync(url);
    return {};
  } catch (e) {
    console.log(`validation error : ${e.message}`);
    return e.message;
  }
};

const parseXML = (feedString, url) => {
  const parser = new DOMParser();
  const feedDocument = parser.parseFromString(feedString, 'text/xml');
  const streamTitle = feedDocument.querySelector('title').textContent;
  const streamDescription = feedDocument.querySelector('description').textContent;
  const posts = [...feedDocument.querySelectorAll('item')].map((item) => {
    console.log(item);
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').nextSibling.textContent;
    const description = item.querySelector('description').textContent;
    // const pubdate = item.querySelector('pubdate').textContent;
    const own = url;
    return {
      title, link, description, /*pubdate,*/ own,
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

const renderLayout = (state) => {
  console.log('rendering layout');
  const layout = document.querySelector('[class="container-xl"]');
  // здесь будет отчистка лэйаута

  const layoutCleaner = (node) => {
    if (node.hasChildNodes()) {
      node.childNodes.forEach((child) => {
        layoutCleaner(child);
      });
    }
    console.log('childNode deleting');
    node.remove();
  };
  layout.childNodes.forEach((childNode) => {
    layoutCleaner(childNode);
  });

  const { childNodes } = layout;
  [...childNodes].forEach((childNode) => {
    layoutCleaner(childNode);
  });

  // *******
  // а здесь вывод стейта

  // ФИДЫ------------------------------------------------
  const feedsContainerCoat = document.createElement('div');
  feedsContainerCoat.classList.add('row');
  layout.appendChild(feedsContainerCoat);

  const feedsContainerInward = document.createElement('div');
  feedsContainerInward.classList.add('col-md-10');
  feedsContainerInward.classList.add('col-lg-8');
  feedsContainerInward.classList.add('mx-auto');
  feedsContainerInward.classList.add('feeds');
  feedsContainerCoat.appendChild(feedsContainerInward);

  const feedsHeader = document.createElement('h2');
  feedsHeader.textContent = 'Feeds';
  feedsContainerInward.appendChild(feedsHeader);

  const feedsList = document.createElement('ul');
  feedsList.classList.add('list-group');
  feedsList.classList.add('mb-5');
  feedsContainerInward.appendChild(feedsList);
  // добавление фидов
  state.layout.feeds.forEach((currentFeed) => {
    const currentFeedItem = document.createElement('li');
    currentFeedItem.classList.add('list-group-item');

    const currentFeedHeader = document.createElement('h3');
    currentFeedHeader.textContent = currentFeed.streamTitle;
    currentFeedItem.appendChild(currentFeedHeader);

    const currentFeedDescription = document.createElement('p');
    currentFeedDescription.textContent = currentFeed.streamDescription;
    currentFeedItem.appendChild(currentFeedDescription);

    feedsList.appendChild(currentFeedItem);
  });
  // ***

  // ПОСТЫ------------------------------------------------
  const postsContainerCoat = document.createElement('div');
  postsContainerCoat.classList.add('row');
  layout.appendChild(postsContainerCoat);

  const postsContainerInward = document.createElement('div');
  postsContainerInward.classList.add('col-md-10');
  postsContainerInward.classList.add('col-lg-8');
  postsContainerInward.classList.add('mx-auto');
  postsContainerInward.classList.add('posts');
  postsContainerCoat.appendChild(postsContainerInward);

  const postsHeader = document.createElement('h2');
  postsHeader.textContent = 'Posts';
  postsContainerInward.appendChild(postsHeader);

  const postsList = document.createElement('ul');
  postsList.classList.add('list-group');
  postsContainerInward.appendChild(postsList);
  // добавление постов

  state.layout.posts.forEach((currentPost) => {
    console.log('current post adding');
    const currentPostItem = document.createElement('li');
    currentPostItem.classList.add('list-group-item');

    const currentPostHref = document.createElement('a');
    currentPostHref.setAttribute('href', currentPost.link);
    currentPostHref.textContent = `${currentPost.title} / ${currentPost.description}`;
    currentPostItem.appendChild(currentPostHref);

    postsList.appendChild(currentPostItem);
  });

  // ***
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
    layout: {
      feeds: [],
      posts: [],
    },
  };

  // константы
  const form = document.querySelector('[class="rss-form form-inline"]');
  const urlField = document.querySelector('[class="form-control"]');
  const submitButton = document.querySelector('[class="btn btn-primary"]');
  
  const feedbackDanger = document.querySelector('[class="feedback text-danger"]');
  const feedbackSuccess = document.querySelector('[class="feedback text-success"]');
  // возможно, здесь также понадобится данжер и succes alert

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
        // здесь сделать отрисовку через renderSuccess;
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
      case 'layout.posts':
        console.log('watched state, state.posts changed');
        renderLayout(state);
        break;
      default:
        break;
    }
  });

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
      .catch((error) => {
        console.log(error);
      });
  });
};
