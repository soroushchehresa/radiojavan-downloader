(function() {
  let buttonLink;
  let downloadLinkLow;
  let downloadLinkHigh;
  let loading;

  function handleAddDownloadButtons() {
    chrome.tabs.query({ 'active': true }, (tabs) => {
      buttonLink = '';
      downloadLinkLow = '';
      downloadLinkHigh = '';
      let parsedUrl = new URL(tabs[0].url);
      let urlParts = parsedUrl.pathname.split('/');
      let musicName = urlParts[3];
      loading = false;
      if (
        !loading &&
        (!downloadLinkHigh || (buttonLink !== downloadLinkHigh)) &&
        (urlParts[1] === 'mp3s' || 'podcasts' || 'videos')
      ) {
        loading = true;
        let formData = new FormData();
        formData.append('id', musicName);
        let request = new XMLHttpRequest();
        request.open('POST', `https://www.radiojavan.com/${urlParts[1] === 'mp3s' ? 'mp3s/mp3_host' : urlParts[1] === 'podcasts' ? 'podcasts/podcast_host' : 'videos/video_host'}`);
        request.onload = function() {
          if (request.status === 200) {
            let contentType = urlParts[1].slice(0, -1);
            let host = JSON.parse(request.response).host;
            downloadLinkLow = `${host}/media/${contentType === 'video' ? 'music_video' : contentType}/${contentType === 'video' ? 'lq' : 'mp3-256'}/${musicName}.${contentType === 'video' ? 'mp4' : 'mp3'}`;
            downloadLinkHigh = `${host}/media/${contentType === 'video' ? 'music_video' : contentType}/${contentType === 'video' ? 'hq' : 'mp3-320'}/${musicName}.${contentType === 'video' ? 'mp4' : 'mp3'}`;
            buttonLink = downloadLinkHigh;
            chrome.tabs.executeScript({
              code: `
                  if (!document.getElementById('download-container')) {
                    var html = '<div id="download-container" style="text-align: center;width: 100%;height: 25px;margin-top: 30px"><a target="_blank" style="color: white; background: #aa2712;padding: 10px 20px;margin: 10px;border-radius: 5px;" href="${downloadLinkLow}">Download ${contentType === 'video' ? 'MP4 Low' : 'MP3 256'}</a><a target="_blank" style="color: white; background: #aa2712;padding: 10px 20px;margin: 10px;border-radius: 5px;" href="${downloadLinkHigh}">Download ${contentType === 'video' ? 'MP4 High' : 'MP3 320'}</a></div>';
                    var div = document.createElement('div');
                    div.innerHTML = html;
                    while (div.children.length > 0) {
                      document.getElementsByClassName("ratingContianer")[0].appendChild(div.children[0]);
                    }
                  }
              `,
            });
            loading = false;
          }
        };
        request.send(formData);
      }
    });
  }

  chrome.webNavigation.onDOMContentLoaded.addListener(() => {
    handleAddDownloadButtons();
  }, { url: [{ hostSuffix: 'radiojavan.com' }] });
  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.url) {
      handleAddDownloadButtons();
    }
  });
}());
