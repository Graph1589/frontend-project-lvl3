
// вынести view слой
// открытие постов в новой вкладке
// ***

import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
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
    watchedState.form.inputError = error;
  };

  urlField.addEventListener('input', (e) => {
    feedbackSuccess.textContent = '';
    watchedState.form.processState = 'filling';
    watchedState.form.injectedUrl = e.target.value;
    updateValidationState(watchedState);
  });

  const addNewPosts = (newPosts, id) => {
    const processedNewPosts = newPosts.map((post) => ({ ...post, id }));
    watchedState.layout.posts = processedNewPosts.concat(state.layout.posts);
  };

  const addRSS = ({
    streamTitle, streamDescription, posts, feedLink,
  }) => {
    const id = _.uniqueId();
    watchedState.layout.feeds = [{
      streamTitle, streamDescription, feedLink, id,
    }, ...state.layout.feeds];
    const processedPosts = posts.map((post) => ({ ...post, id }));
    console.log(processedPosts);
    watchedState.layout.posts = posts.concat(state.layout.posts);
  };

  const getRSS = (url) => {
    axios.get(`${proxy}${url}`)
      .then((response) => {
        const parsedRSS = parseXML(response.data, url);
        addRSS(parsedRSS);
        watchedState.form.processState = 'finished';
        console.log(`state in getRSS function: ${watchedState}`);
        // setTimeout(() => updateRSS(), 5000);
      })
      .catch(() => {
        console.log('catch in GET');
        console.log(`BEFORE watchedState.form.feedError = ${watchedState.form.feedError}`);
        watchedState.form.feedError = 'network';
        console.log(`AFTER watchedState.form.feedError = ${watchedState.form.feedError}`);
      });
  };

  const updateRSS = () => {
    console.log('all feeds:');
    watchedState.layout.feeds.forEach((feed) => {
      console.log(feed.feedLink);
      axios.get(`${proxy}${feed.feedLink}`)
        .then((response) => {
          const { posts } = parseXML(response.data, feed.feedLink);
          const newPosts = _.differenceBy(posts, watchedState.layout.posts, 'postTitle');
          console.log(`state in get in updateRSS function: ${state.layout.feeds}`);
          addNewPosts(newPosts, feed.id);
        })
        .catch((e) => {
          console.log(`error in get in updateRSS function: ${e}`);
        });
    });
    console.log('***');

    setTimeout(() => updateRSS(), 5000);
  };

  setTimeout(updateRSS(), 5000);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
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
