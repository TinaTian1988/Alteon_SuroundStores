// pages/test/test.js
Page({
  data:{},
  onLoad:function(options){
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        var latitude = res.latitude
        var longitude = res.longitude
        var speed = res.speed
        var accuracy = res.accuracy
        console.log("纬度："+latitude);
        console.log("经度："+longitude);
        console.log("速度："+speed);
        console.log("精确度："+accuracy);
      }
    });
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})