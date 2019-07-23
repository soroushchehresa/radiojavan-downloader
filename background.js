(function (listener) {
  let buttonLink;
  let downloadLink256;
  let downloadLink320;
  let loading;
  function handleAddDownloadButtons() {
    buttonLink = '';
    downloadLink256 = '';
    downloadLink320 = '';
    loading = false;
    if (!loading && (!downloadLink320 || (buttonLink !== downloadLink320))) {
      loading = true;
      let formData = new FormData();
      formData.append('id', 'Koorosh-Yebaram-Man-(Ft-Arta-Behzad-Leito-Raha)');
      let request = new XMLHttpRequest();
      request.open('POST', 'https://www.radiojavan.com/mp3s/mp3_host');
      request.onload = function () {
        if (request.status === 200) {
          chrome.tabs.query({ 'active': true }, function (tabs) {
            let parsedUrl = new URL(tabs[0].url);
            if (parsedUrl.origin === 'https://www.radiojavan.com') {
              let urlParts = parsedUrl.pathname.split('/');
              let musicName = urlParts[3];
              if (urlParts[1] === 'mp3s' || 'podcasts') {
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
              }
              loading = false;
            }
          });
        }
      };
      request.send(formData);
    }
  }
  chrome.webNavigation.onDOMContentLoaded.addListener((details) => {
    handleAddDownloadButtons();
  }, { url: [{ hostSuffix: 'radiojavan.com' }] });
  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.url) {
      handleAddDownloadButtons();
    }
  });
}());
