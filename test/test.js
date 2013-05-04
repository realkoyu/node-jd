var JDClient = require('../lib/node-jd');

var options = {
    method: 'jingdong.warecategory.get',
    app_key: '481CD7AB2FD1674FF6D6694CF070B593',
    app_secrect: '4cd3af60fd6f47f7a26d95801e88328d'
};
var jdClient = new JDClient(options, 'dev');

var parameters = {
    cid: 0,
    level: 1
};
jdClient.doRequest(parameters, function(resultStr){
    console.log(resultStr);
});