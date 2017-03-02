// pages/chooseArea/chooseArea.js
var app = getApp();
Page({
  data:{
    showTopTips:false,
    errorMsg:'',
    index:-1,
    array:null
  },
  onLoad:function(options){
    var that = this;
    
    wx.request({
      url: app.globalData.baseUrl+'/API/GetArea',
      method:'post',
      header: { 'content-type': 'application/json' },
      success: function(res){
        if(res.data.Error==0){
          that.setData({
            array:res.data.Data,
          });
        }
      }
    });
  },
  bindPickerChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },
  commit:function(){
    var _area=this.data.array[this.data.index];
    var _openId=wx.getStorageSync('openId');
    wx.request({
      url: app.globalData.baseUrl+'/API/SetUserArea',
      data:{
        area:_area,
        openId:_openId
        },
      method:'post',
      header: { 'content-type': 'application/json' },
      success: function(res){
        if(res.data.Error==0){
          wx.navigateTo({
            url: '../personal/personal?openId='+_openId
          });
        }
      }
    });
  }
})