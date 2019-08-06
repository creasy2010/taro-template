module.exports = function () {

  const urllib = require('urllib');

  const moduleId = '10241';
  const url = `https://imgcook.taobao.org/api/getModule?moduleId=${moduleId}`;

  return new Promise((resolve) => {
    urllib.request(url, (err, data) => {
      const moduleData = JSON.parse(data.toString()).data;
      resolve({
        data: JSON.parse(moduleData.json),
        originData: JSON.parse(moduleData.originjson)
      });
    });
  });
}
