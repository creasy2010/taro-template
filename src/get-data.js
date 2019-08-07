module.exports = function (moduleId) {

  const urllib = require('urllib');

  const url = `https://imgcook.taobao.org/api/getModule?moduleId=${moduleId}`;

  return new Promise((resolve) => {
    urllib.request(url, (err, data) => {
      try {
        const moduleData = JSON.parse(data.toString()).data;
        resolve({
          data: JSON.parse(moduleData.json),
          originData: JSON.parse(moduleData.originjson)
        });
      } catch (e) {
        throw new Error("读取imgcook layout数据失败");
      }
    });
  });
}
