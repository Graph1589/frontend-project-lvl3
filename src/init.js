import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import resources from './locales';
import {
  renderLayout, renderInputError, renderFeedError, renderSuccessMessage,
} from './renderers';
import validate from './validator';
import parseXML from './parser';
import view from './view';

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

  i18next.init({
    lng: 'en',
    debug: false,
    resources,
  }).then(() => {
    // renderLayout(state, t);
  });

  const proxy = 'https://hexlet-allorigins.herokuapp.com/raw?disableCache=true&url=';

  const form = document.querySelector('[class="rss-form form-inline mt-3"]');
  const submitButton = document.querySelector('[type="submit"]');
  const urlField = document.querySelector('[name="url"]');

  const feedbackSuccess = document.querySelector('[class="feedback text-success"]');

  const processStateHandler = (processState) => {
    switch (processState) {
      case 'failed':
        submitButton.disabled = true;
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

  const watchedState = view(
    state, processStateHandler, renderInputError, renderFeedError, renderLayout,
  );

  const getFeedsList = () => state.layout.feeds.map((feed) => feed.feedLink);

  const updateValidationState = () => {
    const error = validate(watchedState.form.injectedUrl, getFeedsList());
    watchedState.form.valid = (error === '');
    watchedState.form.inputError = error;
  };

  urlField.addEventListener('input', (e) => {
    console.log(urlField);
    console.log('input');
    feedbackSuccess.textContent = '';
    watchedState.form.processState = 'filling';
    watchedState.form.injectedUrl = e.target.value;
    updateValidationState();
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
      streamTitle, streamDescription, feedLink, id, viewed: 'false',
    }, ...state.layout.feeds];
    const processedPosts = posts.map((post) => ({ ...post, id }));
    watchedState.layout.posts = processedPosts.concat(state.layout.posts);
  };

  const getRSS = (url) => {
    axios.get(`${proxy}${url}`)
      .then((response) => {
        const parsedRSS = parseXML(response.data, url);
        addRSS(parsedRSS);
        watchedState.form.processState = 'finished';
      })
      .catch(() => {
        watchedState.form.feedError = 'network';
      });
  };

  const updateRSS = () => {
    watchedState.layout.feeds.forEach((feed) => {
      axios.get(`${proxy}${feed.feedLink}`)
        .then((response) => {
          const { posts } = parseXML(response.data, feed.feedLink);
          const newPosts = _.differenceBy(posts, watchedState.layout.posts, 'postTitle');
          addNewPosts(newPosts, feed.id);
        })
        .catch((e) => {
          throw new Error(e);
        });
    });

    setTimeout(() => updateRSS(), 5000);
  };

  setTimeout(updateRSS(), 5000);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.processState = 'sending';
    getRSS(urlField.value);
  });
};
