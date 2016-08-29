var request = require('request');
var qs = require('querystring');
var fs = require('fs');

var title = '';
var fileStr = '';

var jobsArr = [];
var pags = 0;
var nowPage = 0;

var queryData = {
  px: 'default',
  city: '广州',
  needAddtionalResult: 'false'
}
var formData = {
  first: true,
  pn: 1,
  kd: 'web前端'
};

var queryStr = qs.stringify(queryData);
var fromDataStr =  qs.stringify(formData);

var options = {
  method: 'post',
  url: 'http://www.lagou.com/jobs/positionAjax.json?' + queryStr + '&' + fromDataStr
};

function reqJob(options){
  request(options, function(er, res, body){
    var obj = JSON.parse(body);
    jobsArr = jobsArr.concat(obj.content.positionResult.result);
    // 拉钩的分页
    if(pags==0){
      var pageSize = obj.content.pageSize;
      var totalCount = obj.content.positionResult.totalCount;
      if(totalCount/pageSize > 30){
        pags = 30;
      }else{
        pags = Math.ceil(totalCount/pageSize);
      }
      // 新建文件
      title = '【'+ queryData.city +'】 【拉勾】 【'+ formData.kd +'】--- 小爬爬数据（拉勾仅展示'+ pags*15 +'条） \r\n';
      fs.writeFile(__dirname + '/拉勾前端职位.txt', new Buffer(title), {flag: 'a'}, function (err) {
        if(err) {
          console.error(err);
        } else {
          console.log('写入成功');
        }
      });
    }
    if(nowPage < pags){
      formData.first = false;
      formData.pn = nowPage + 1;
      fromDataStr = qs.stringify(formData);
      options.url = 'http://www.lagou.com/jobs/positionAjax.json?' + queryStr + '&' + fromDataStr
      reqJob(options);
    }else{
      var sortArr = jobsArr.sort(function(a, b){
        return parseInt(a.salary.split('k')[0]) - parseInt(b.salary.split('k')[0]);
      });
      sortArr.forEach(function(item){
        fileStr = '[' + item.salary + ']   ' + '[' + item.workYear + ']   ' + '[' + item.district + ']   ' + '[' + item.companyFullName + ']  \r\n';
        fs.appendFile(__dirname + '/拉勾前端职位.txt', fileStr, function () {
          console.log('完成');
        });
      });
    }
    nowPage++     
  });
}
// 小爬爬
reqJob(options);
