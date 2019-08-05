
module.exports = function () {

  const urllib = require('urllib');
  const url = 'https://imgcook.taobao.org/api-open/code-acquire';
  const reqData = {
    mod_id: 10241, // 项目id
    dsl_id: 1,
    access_id: 'OsyODioQfabXCMZB' // imgcook账号的access_id
  }

  return new Promise((resolve) => {
    urllib.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      data: reqData
    }, (err, data) => {
      const moduleData = JSON.parse(data.toString()).data.moduleData;
      resolve({
        data: JSON.parse(moduleData.json),
        originData: JSON.parse(moduleData.originjson)
      });
    });
  });
}
