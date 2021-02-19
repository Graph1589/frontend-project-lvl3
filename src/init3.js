
// генерировать id для фидов и постов
// возможно убрать полную отчистку layout
// ***

import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import _, { differenceBy, find, isEmpty } from 'lodash';
import resources from './locales';
import {
  renderLayout, renderInputError, renderFeedError, renderSuccessMessage,
} from './renderers';
import validate from './validator';
import parseXML from './parser';
// import view form './view';


export default () => {
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

  // const proxy = 'https://cors-anywhere.herokuapp.com/';
  const proxy = 'https://hexlet-allorigins.herokuapp.com/raw?disableCache=true&url=';

  const form = document.querySelector('[class="rss-form form-inline"]');
  const urlField = document.querySelector('[class="form-control"]');
  const submitButton = document.querySelector('[class="btn btn-primary"]');

  const feedbackSuccess = document.querySelector('[class="feedback text-success"]');

  const processStateHandler = (processState) => {
    console.log(processState);
    switch (processState) {
      case 'failed':
        submitButton.disabled = false;
        break;
      case 'filling':
        submitButton.disabled = false;
        renderSuccessMessage('');
        break;
      case 'sending':
        submitButton.disabled = true;
        break;
      case 'finished':
        urlField.value = '';
        renderSuccessMessage('added');
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
        renderFeedError(value);
        break;
      case 'layout.posts':
        renderLayout(state);
        break;
      default:
        break;
    }
  });

  const getFeedsList = () => watchedState.layout.feeds.map((feed) => feed.url);

  const updateValidationState = () => {
    const error = validate(watchedState.form.injectedUrl, getFeedsList());
    watchedState.form.valid = (error === '');
    console.log(`updatevalidationstate-ERROR-${error}`);
    watchedState.form.inputError = error;
  };

  const addRSS = ({
    url, streamTitle, streamDescription, posts,
  }) => {
    console.log(`${url}`);
    if (_.find(watchedState.layout.feeds, ['url', url])) {
      const newPosts = differenceBy(watchedState.layout.posts, posts, 'title');
      console.log(newPosts);
      console.log(state);
    } else {
      watchedState.layout.feeds = [{ url, streamTitle, streamDescription }, ...state.layout.feeds];
      watchedState.layout.posts = posts.concat(state.layout.posts);
    }
  };

  urlField.addEventListener('input', (e) => {
    feedbackSuccess.textContent = '';
    watchedState.form.processState = 'filling';
    watchedState.form.injectedUrl = e.target.value;
    updateValidationState(watchedState);
  });

  const getRSS = (url) => {
    axios.get(`${proxy}${url}`)
      .then((response) => {
        const parsedRSS = parseXML(response.data, url);
        addRSS(parsedRSS);
        watchedState.form.processState = 'finished';
      })
      .catch(() => {
        console.log('catch in GET');
        console.log(`BEFORE watchedState.form.feedError = ${watchedState.form.feedError}`);
        watchedState.form.feedError = 'network';
        console.log(`AFTER watchedState.form.feedError = ${watchedState.form.feedError}`);
      });
  };
  const updateRSS = () => {
    watchedState.layout.feeds.forEach((feed) => {
      const { url } = feed;
      console.log(feed.url);
      axios.get(`${proxy}${url}`)
        .then((response) => {
          const parsedRSS = parseXML(response.data, url);
          const newPosts = _.differenceBy(parsedRSS.posts, watchedState.layout.posts, 'title');
          watchedState.layout.posts = newPosts.concat(watchedState.layout.posts);
        })
      //  .then(({
      //    url, streamTitle, streamDescription, posts,
      //  }) => {
      //    console.log(streamTitle);
      //  })
        .catch((e) => {
          console.log(e);
        });
    });
    // if (newPosts.lenght !== 0) {
    //   newPosts.items.unshift(state.layout.posts);
    // }
    setTimeout(updateRSS, 5000);
  };

  setTimeout(updateRSS, 5000);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('sending');
    watchedState.form.processState = 'sending';
    getRSS(urlField.value);
  });

  i18next.init({
    lng: 'en',
    debug: false,
    resources,
  }).then((t) => {
    renderLayout(state, t);
  });
};
