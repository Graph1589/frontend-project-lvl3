import onChange from 'on-change';

export default (
  state, processStateHandler, renderInputError, renderFeedError, renderLayout,
) => onChange(state, (path, value) => {
  switch (path) {
    case 'form.processState':
      processStateHandler(value);
      break;
    case 'form.valid':
      processStateHandler(value ? 'filling' : 'failed');
      break;
    case 'form.inputError':
      renderInputError(value);
      break;
    case 'form.feedError':
      processStateHandler('networkError');
      break;
    case 'layout.posts':
      renderLayout(state);
      break;
    default:
      break;
  }
});
