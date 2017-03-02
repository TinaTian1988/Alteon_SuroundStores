// pages/wifi/wifi.js
Page({
  data:{
    height:0,
    headHeight:0,
    bodyHeight:0,
  },
  onLoad:function(options){
    var that=this;
    //按比例设置高度
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          height: res.windowHeight,
          headHeight: res.windowHeight * 0.3,
          bodyHeight: res.windowHeight * 0.7,
        });
      }
    });
  },
  
})