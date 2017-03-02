// pages/uploadImage/uploadImage.js
var app = getApp();
Page({
  data: {
    userId: 0,

    showTopTips: false,//是否显示错误提示
    errorMsg: '',//错误提示

    uploadImages: null,
    txtInput: '',

    count: -2
  },
  onLoad: function (options) {
    this.setData({ userId: options.id });
    var that = this;
    wx.chooseImage({
      count: 9, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        that.setData({
          uploadImages: res.tempFilePaths,
          count: res.tempFilePaths.length
        });
      }
    });

  },
  getInput: function (e) {
    this.setData({
      txtInput: e.detail.value
    });
  },
  //发布（上传图片）
  commit: function () {
    var _count = this.data.count;
    if (_count == 0) {
      return;
    }
    if (this.data.txtInput == '') {
      this.showTopTips('说点什么吧');
      return;
    }
    var that = this;
    var loginUser=wx.getStorageSync("loginUser");
    wx.uploadFile({
      url: app.globalData.baseUrl + '/API/PublishAdver',
      filePath: that.data.uploadImages[_count - 1],
      name: 'adver',
      formData: {
        'userId': that.data.userId,
        'openId': loginUser.openId,
        'desc': that.data.txtInput,
        'type': 1
      },
      success: function (res) {
        var _result = JSON.parse(res.data);
        if (_result.Error == 0) {
          console.log(_count);
          if (_count > 1) {
            that.data.count = _count - 1;
            that.commit();
          }
          else {
            wx.redirectTo({
              url: '../personal/personal?openId=' + loginUser.openId
            });
          }
        }
      }
    });

  },
  //顶部错误提示框
  showTopTips: function (msg) {
    var that = this;
    this.setData({
      showTopTips: true,
      errorMsg: msg
    });
    setTimeout(function () {
      that.setData({
        showTopTips: false
      });
    }, 3000);
  }
})