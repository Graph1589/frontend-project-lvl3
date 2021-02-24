const parseXML = (feedString, feedLink) => {
  const parser = new DOMParser();
  const feedDocument = parser.parseFromString(feedString, 'text/xml');
  const streamTitle = feedDocument.querySelector('title').textContent;
  const streamDescription = feedDocument.querySelector('description').textContent;
  const posts = [...feedDocument.querySelectorAll('item')].map((item) => {
    const postTitle = item.querySelector('title').textContent;
    const postLink = item.querySelector('link').textContent;
    const postDescription = item.querySelector('description').textContent;
    return {
      postTitle, postLink, postDescription,
    };
  });
  return {
    streamTitle, streamDescription, posts, feedLink,
  };
};

export default parseXML;
