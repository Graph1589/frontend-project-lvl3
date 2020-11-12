
import onChange from 'on-change';
import axios from 'axios';
import * as yup from 'yup';

// proxy part
/*
var host = process.env.HOST || '0.0.0.0';
var port = process.env.POST || 8080;

var cors_proxy = require('cors-anywhere');
cors_proxy.createServer({
  originWhiteList: [],
  requireHeader: ['origin', 'x-requested-with'],
  removeHeaders: ['cookie', 'cookie2'],
}).listen(port, host, function() {
  console.log('Running CORS Anywhere on ' + host + ':' + post);
}); */
//
const schema = yup.string().url();

// const proxy = 'http://cors-anywhere.herokuapp.com/';
const proxy = axios.create({
  baseURL: 'https://cors-anywhere.herokuapp.com/',
});

const validate = (url) => {
  try {
    schema.validateSync(url);
    return '';
  } catch (e) {
    console.log('NEVALIDNO!!!');
    return e.message;
  }
};


const parseXML = (feedString) => {
  const parser = new DOMParser();
  const feedDocument = parser.parseFromString(feedString, 'text/html');
  const title = feedDocument.querySelector('title');
  const description = feedDocument.querySelector('description');
  const posts = [...feedDocument.querySelectorAll('item')].map((item) => [item.querySelector('title').value, item.querySelector('link').value]);

  console.log(feedDocument.querySelectorAll('item'));
  console.log(posts);
  return {
    // posts: [ feedDocument.querySelectorAll('')],
  };
};

export default () => {
  const state = {
    form: {
      state: 'filling',
      valid: 'true',
      error: '',
    },
  };

  // const feeds = [];
  // const posts = [];

  const form = document.querySelector('[class="rss-form form-inline"]');
  const submitButton = document.querySelector('[class="btn btn-primary"]');
  const urlField = document.querySelector('[class="form-control"]');
  const feedsColumn = document.querySelector('[class="col-md-10 col-lg-8 mx-auto feeds"]');
  const alertDanger = document.querySelector('[class="feedback text-danger"]');
  const alertSuccess = document.querySelector('[class="alert alert-success"]');

  const formState = onChange(state.form, (path, value) => {
    console.log('CHANGED');
    // console.log(path);
    console.log(value);
    if (state.form.status === 'sended') {
      console.log('valid');
      urlField.classList.remove('is-invalid');
      console.log(`${urlField.value}`);
      proxy.get(`${urlField.value}`)
        .then((response) => {
          console.log(response.request.response);
          parseXML(response.request.response);
          //console.log(parseXML(response.request.response).querySelector('title'));
          formState.status = 'during';
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      urlField.classList.add('is-invalid');
      console.log('invalid');
    }
    submitButton.classList.remove('disabled');
    alertDanger.textContent = formState.error;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitButton.classList.add('disabled');

    state.form.error = validate(urlField.value);
    formState.status = 'sended';
  });
};
