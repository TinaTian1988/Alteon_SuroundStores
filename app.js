//app.js
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

  },
  getUserInfo: function () {
    var that = this
    var loginUser = wx.getStorageSync('loginUser');
    //console.log("1："+JSON.stringify(loginUser));
    if (!loginUser) {
      console.log('没有缓存信息，重新获取');
      //调用登录接口
      wx.login({
        success: function (res) {
          wx.getUserInfo({
            success: function (r) {
              if (res.code && r.encryptedData && r.iv) {
                //发起网络请求
                wx.request({
                  url: that.globalData.baseUrl + '/API/WeiXinLogin',
                  data: {
                    code: res.code,
                    rawData:r.rawData,
                    signature:r.signature,
                    encryptedData:r.encryptedData,
                    iv:r.iv
                  },
                  method: 'get',
                  header: { 'content-type': 'application/json' },
                  success:function(d){
                    if(d.data.Error == 0){
                      //console.log("解密后的数据:"+JSON.stringify(d.data.Data));
                      var loginUser={
                        openId:d.data.Data.openId,
                        nickName:d.data.Data.nickName,
                        avatarUrl:d.data.Data.avatarUrl,
                        style:1
                      };
                      wx.setStorageSync('loginUser', loginUser);
                    }
                    else{
                      console.log(d.data.Msg);
                    }
                  }
                })
              }
              else {
                console.log('获取用户登录态失败！' + res.errMsg)
              }
            }
          });

        }
      });
    }
  },
  globalData: {
    baseUrl: 'https://www.alteon.info'//'http://localhost:22320'//
  }
})

/*
  获取微信用户信息：
  var userInfo = {
    nickName: " 甜不甜", 
    avatarUrl: "http://wx.qlogo.cn/mmhead/ajNVdqHZLLCND3iap06hyoltic1HqiaO29FfFvTiazJAfVUEicE4Xs1icfiaA/132", 
    gender: 2, 
    province: "Guangdong", 
    city: "Guangzhou"
  }

  
  登录后商家的信息：(在password页面和login页面存入)
  var loginUser={
    mobile:that.data.mobile,
    password:that.data.password2,
    openId:app.globalData.openId,
    nickName:app.globalData.userInfo.nickName,
    avatarUrl:app.globalData.userInfo.avatarUrl,
    style:2//用户类型：1用户；2商家
  };

*/