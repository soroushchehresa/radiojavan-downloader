(function() {
  let buttonLink;
  let downloadLink256;
  let downloadLink320;
  let loading;

  function handleAddDownloadButtons() {
    chrome.tabs.query({ 'active': true }, (tabs) => {
      buttonLink = '';
      downloadLink256 = '';
      downloadLink320 = '';
      let parsedUrl = new URL(tabs[0].url);
      let urlParts = parsedUrl.pathname.split('/');
      let musicName = urlParts[3];
      loading = false;
      if (
        !loading &&
        (!downloadLink320 || (buttonLink !== downloadLink320)) &&
        (urlParts[1] === 'mp3s' || 'podcasts')
      ) {
        loading = true;
        let formData = new FormData();
        formData.append('id', musicName);
        let request = new XMLHttpRequest();
        request.open('POST', `https://www.radiojavan.com/${urlParts[1] === 'mp3s' ? 'mp3s/mp3_host' : 'podcasts/podcast_host'}`);
        request.onload = function() {
          if (request.status === 200) {
              let contentType = urlParts[1].slice(0, -1);
              downloadLink256 = `${JSON.parse(request.response).host}/media/${contentType}/mp3-256/${musicName}.mp3`;
              downloadLink320 = `${JSON.parse(request.response).host}/media/${contentType}/mp3-320/${musicName}.mp3`;
              buttonLink = downloadLink320;
              chrome.tabs.executeScript({
                code: `
                      if (!document.getElementById('download-container')) {
                        var html = '<div id="download-container" style="text-align: center;width: 100%;height: 25px;margin-top: 30px"><a target="_blank" style="color: white; background: #aa2712;padding: 10px 20px;margin: 10px;border-radius: 5px;" href="${downloadLink256}">Download 256</a><a target="_blank" style="color: white; background: #aa2712;padding: 10px 20px;margin: 10px;border-radius: 5px;" href="${downloadLink320}">Download 320</a></div>';
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
