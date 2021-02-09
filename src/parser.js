const parseXML = (feedString, url) => {
  const parser = new DOMParser();
  const feedDocument = parser.parseFromString(feedString, 'text/xml');
  const streamTitle = feedDocument.querySelector('title').textContent;
  const streamDescription = feedDocument.querySelector('description').textContent;
  const posts = [...feedDocument.querySelectorAll('item')].map((item) => {
    // console.log(item);
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').nextSibling.textContent;
    const description = item.querySelector('description').textContent;
    // const pubdate = item.querySelector('pubdate').textContent;
    const own = url;
    return {
      title, link, description, /*pubdate,*/ own,
    };
  });
  // заголовок и описание вытаскиваются нормально, но посты при итерации пустые
  //
  // console.log([...feedDocument.querySelectorAll('item')]);
  // console.log(title.textContent);
  // console.log(description.textContent);
  return {
    url, streamTitle, streamDescription, posts,
  };
  // posts: [ feedDocument.querySelectorAll('')],
  // пока ничего не возвращается + парсер нужно вынести в модуль
};

export default parseXML;
