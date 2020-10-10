
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
    return e.message;
  }
};

export default () => {
  const state = {
    form: {
      error: '',
    },
  };

  // const feeds = [];
  // const posts = [];

  const form = document.querySelector('[class="rss-form form-inline"]');
  // const submitionButton = document.querySelector('[class="btn btn-primary"]');
  const urlField = document.querySelector('[class="form-control"]');
  const feedbackDanger = document.querySelector('[class="feedback text-danger"]');

  const formState = onChange(state.form, (path, value) => {
    console.log('CHANGED');
    // console.log(path);
    console.log(value);
    if (value !== '') {
      urlField.classList.add('is-invalid');
      console.log('invalid');
    } else {
      console.log('valid');
      urlField.classList.remove('is-invalid');
      console.log(`${urlField.value}`);
      proxy.get(`${urlField.value}`)
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        });
    }
    feedbackDanger.textContent = value;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    formState.error = validate(urlField.value);
  });
};
