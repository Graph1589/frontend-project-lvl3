/*
import onChange from 'on-change';

export default (state, processStateHandler, submitButton) => onChange(state, (path, value) => {
  switch (path) {
    case 'form.processState':
      processStateHandler(value);
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
*/
