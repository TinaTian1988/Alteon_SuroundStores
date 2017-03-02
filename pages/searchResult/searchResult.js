// pages/searchResult/searchResult.js
var app = getApp();
Page({
  data:{
    height:0,
    headHeight:0,
    bodyHeight:0,

    baseUrl:'',
    list:null
  },
  onLoad:function(options){
    if(!options.areaId||!options.keyword){
      return;
    }
    var that=this;
    //按比例设置高度
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          height: res.windowHeight,
          headHeight: res.windowHeight * 0.1,
          bodyHeight: res.windowHeight * 0.9,
          baseUrl:app.globalData.baseUrl
        });
      }
    });
    wx.request({
    url: that.data.baseUrl + '/API/GetBusinessByKeyword',
    data: {
      areaId:options.areaId,
      keyword: options.keyword
    },
    method: 'post',
    header: { 'content-type': 'application/json' },
    success: function (res) {
      if(res.data.Error==0){
        that.setData({
          list:res.data.Data
        });
      }
    }
  });
  },
  bindViewTap:function(e){
    var loginUser = wx.getStorageSync('loginUser');
    if (!e.target.dataset.openid || !loginUser.openId) {
      return;
    }
    wx.navigateTo({
      url: '../personal/personal?openId=' + e.target.dataset.openid
    })
  }
})