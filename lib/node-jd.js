/*!
 * node-jd
 * Copyright(c) 2013 victor guo <victor.guo@d1miao.com>
 * MIT Licensed
 */
var crypto = require('crypto'),
    http = require('http'),
    queryString = require('querystring');
    
function formatDate() {
    var d = new Date();
    var y = d.getFullYear();
    var M = d.getMonth() + 1;
    var dt = d.getDate();
    var h = d.getHours();
    var m = d.getMinutes();
    var s = d.getSeconds();
    
    M = M<10?"0"+M:M;
    dt = dt<10?"0"+dt:dt;
    h = h<10?"0"+h:h;
    m = m<10?"0"+m:m;
    s = s<10?"0"+s:s;

    return y+"-"+M+"-"+dt+' '+h+':'+m+':'+s;
}    
    
function JDClient(options, environment)
{
    this.prodEnv = {
        host: 'gw.api.360buy.com',
        path: '/routerjson'
    };

    this.devEnv = {
        host: 'gw.api.sandbox.360buy.com',
        path: '/routerjson'
    }
    
    this.sysConfig = {
        method: '',
        app_key: '',
        timestamp: '',
        v: '2.0' //  JD Seems to only have version 2.0
    }
    
    this.app_secrect = '';
    
    this.env = this.prodEnv;
    
    if(options!==undefined && options.method)
    {
        if(environment && environment == "dev")
        {
            this.env = this.devEnv;
        }
        
        this.sysConfig.method = options.method;
        if(options.access_token !== undefined)
        {
            this.sysConfig.access_token = options.access_token;    
        }
        this.sysConfig.app_key = options.app_key;
        this.sysConfig.timestamp = formatDate();
        console.log(this.sysConfig.timestamp);
        this.app_secrect = options.app_secrect;
        
        return this;
    }
    else
    {
        throw new Error('A method name is required');
    }
}

JDClient.prototype.doRequest = function(params, callback){
    this.sysConfig['360buy_param_json'] = JSON.stringify(params);
    this.sysConfig.sign = this.createSign(this.sysConfig);
    
    var queryStr = queryString.stringify(this.sysConfig);
    console.log(queryStr);
    var options = {
        hostname: this.env.host,
        port: 80,
        path: this.env.path,
        method: 'POST',
        headers:{
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': queryStr.length
        }
    };
    
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        var resultStr = '';
        res.on('data', function (chunk) {
            resultStr+=chunk;
        });
        res.on('end', function(){
            callback(resultStr);
        });
    });
    req.write(queryStr);
    req.end();
}
// Use MD5 to create a sign
JDClient.prototype.createSign = function(args) {
    var names = [];
    for (var arg in args) {
        if (args.hasOwnProperty(arg)) {
            names.push(arg);
        }
    }
    names = names.sort();    
    var ss = [this.app_secrect];
    for (var i in names) {
        var n = names[i];
        ss.push(n);
        ss.push(args[n]);
    }
    ss.push(this.app_secrect);
    var str = ss.join('');
    var md5 = crypto.createHash('md5').update(str).digest('hex');
    return md5.toUpperCase();
};

module.exports = JDClient;