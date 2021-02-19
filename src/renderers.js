import i18next from 'i18next';
import isEmpty from 'lodash';

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
  feedsContainerInward.classList.add('col-md-10', 'col-lg-8', 'mx-auto', 'feeds');
  feedsContainerCoat.appendChild(feedsContainerInward);

  const feedsHeader = document.createElement('h2');
  feedsHeader.textContent = 'Feeds';
  feedsContainerInward.appendChild(feedsHeader);

  const feedsList = document.createElement('ul');
  feedsList.classList.add('list-group', 'mb-5');
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
  postsContainerInward.classList.add('col-md-10', 'col-lg-8', 'mx-auto', 'posts');
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
      console.log(currentPost.link);
    const currentPostItem = document.createElement('li');
    currentPostItem.classList.add('list-group-item');

    const currentPostHref = document.createElement('a');
    currentPostHref.setAttribute('href', currentPost.link);
    currentPostHref.textContent = `${currentPost.title} / ${currentPost.description}`;
    currentPostItem.appendChild(currentPostHref);

    postsList.appendChild(currentPostItem);
  });
};

const feedbackDanger = document.querySelector('[class="feedback text-danger"]');
const successMessage = document.querySelector('[class="feedback text-success"]');

const renderInputError = (errorName) => {
  console.log(`render error function get value - ${errorName}`);
  feedbackDanger.textContent = !(errorName === '') ? i18next.t(`errors.input.${errorName}`) : '';
};

const renderFeedError = (errorName) => {
  feedbackDanger.textContent = !(errorName === '') ? i18next.t(`errors.feed.${errorName}`) : '';
};

const renderSuccessMessage = (messageName) => {
  console.log('SUCCESS MESSAGE RENDERER');
  successMessage.textContent = !(messageName === '') ? i18next.t(`messages.${messageName}`) : '';
};

export {
  renderLayout, renderInputError, renderFeedError, renderSuccessMessage,
};
