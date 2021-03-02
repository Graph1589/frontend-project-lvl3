import i18next from 'i18next';

const renderLayout = (state) => {
  const layout = document.querySelector('[id="layout"]');
  const modalTitle = document.querySelector('[class="modal-title"]');
  const modalContent = document.querySelector('[class="modal-body"]');
  const modalRedirectButton = document.querySelector('[id="redirectButton"]');

  const layoutCleaner = (node) => {
    if (node.hasChildNodes()) {
      node.childNodes.forEach((child) => {
        layoutCleaner(child);
      });
    }
    node.remove();
  };
  layout.childNodes.forEach((childNode) => {
    layoutCleaner(childNode);
  });

  const { childNodes } = layout;
  [...childNodes].forEach((childNode) => {
    layoutCleaner(childNode);
  });

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

  state.layout.posts.forEach((currentPost) => {
    const currentPostItem = document.createElement('li');
    currentPostItem.classList.add('list-group-item');

    const currentPostHref = document.createElement('a');
    currentPostHref.setAttribute('href', currentPost.postLink);
    currentPostHref.setAttribute('target', '_blank');
    currentPostHref.textContent = currentPost.postTitle;
    if (!currentPost.viewed) {
      currentPostHref.classList.add('font-weight-bold');
    }
    currentPostItem.appendChild(currentPostHref);
    currentPostHref.addEventListener('click', () => {
      const post = currentPost;
      post.viewed = true;
      currentPostHref.classList.replace('font-weight-bold', 'font-weight-normal');
    });
    const previewButton = document.createElement('button');
    previewButton.textContent = 'Preview';
    previewButton.classList.add('btn-primary', 'btn', 'btn-sm');
    previewButton.setAttribute('data-toggle', 'modal');
    previewButton.setAttribute('data-target', '#exampleModal');
    previewButton.addEventListener('click', () => {
      modalTitle.textContent = currentPost.postTitle;
      modalContent.textContent = currentPost.postDescription;
      const post = currentPost;
      post.viewed = true;
      currentPostHref.classList.replace('font-weight-bold', 'font-weight-normal');
      modalRedirectButton.href = currentPost.postLink;
    });
    currentPostItem.appendChild(previewButton);

    postsList.appendChild(currentPostItem);
  });
};

const feedbackDanger = document.querySelector('[class="feedback text-danger"]');
const successMessage = document.querySelector('[class="feedback text-success"]');

const renderInputError = (errorName) => {
  feedbackDanger.textContent = !(errorName === '') ? i18next.t(`errors.input.${errorName}`) : '';
};

const renderFeedError = (errorName) => {
  feedbackDanger.textContent = !(errorName === '') ? i18next.t(`errors.feed.${errorName}`) : '';
};

const renderSuccessMessage = (messageName) => {
  successMessage.textContent = !(messageName === '') ? i18next.t(`messages.${messageName}`) : '';
};

export {
  renderLayout, renderInputError, renderFeedError, renderSuccessMessage,
};
