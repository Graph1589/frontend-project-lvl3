const parseXML = (feedString, url) => {
  const parser = new DOMParser();
  const feedDocument = parser.parseFromString(feedString, 'text/xml');
    console.log(feedString);
    console.log(url);
  const streamTitle = feedDocument.querySelector('title').textContent;
  const streamDescription = feedDocument.querySelector('description').textContent;
  const posts = [...feedDocument.querySelectorAll('item')].map((item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').nextSibling.textContent;
    const description = item.querySelector('description').textContent;
      const pubdate = item.querySelector('pubDate').textContent;
      console.log(pubdate);
    const own = url;
    return {
      title, link, description, own,
    };
  });
  return {
    url, streamTitle, streamDescription, posts,
  };
};

export default parseXML;
