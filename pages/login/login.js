// pages/login/login.js
var app = getApp();
Page({
  data: {
    showTopTips: false,//是否显示错误提示
    errorMsg: '',//错误提示
    mobile: '',//用户输入手机号
    password: '',
    isMobileChecked: false//手机号码检查通过
  },
  onLoad: function (options) {
    if (options.mobile && options.mobile.length == 11 && options.password) {
      this.setData({
        mobile: options.mobile,
        password: options.password,
        isMobileChecked: true
      });
    }
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
  },



  //获取用户输入手机号码，并验证手机号码的正确性：
  getMobile: function (e) {
    var _input = e.detail.value.trim();
    if (_input.length != 11) {
      return;
    }
    var regMobile = /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
    if (!regMobile.test(_input)) {
      this.showTopTips('请输入正确的手机号码');
      return;
    }
    this.setData({
      mobile: _input,
      isMobileChecked: true
    });
  },
  getPassword: function (e) {
    var _input = e.detail.value.trim();
    if (_input.length < 8) {
      return;
    }
    this.data.password = _input;

  },
  //确认登录
  login: function () {
    if (!this.data.isMobileChecked || !this.data.mobile || !this.data.password) {
      return;
    }
    var that = this;
    wx.request({
      url: app.globalData.baseUrl + '/API/Login',
      data: {
        mobile: this.data.mobile.trim(),
        password: this.data.password.trim(),
      },
      header: {
        'content-type': 'application/json'
      },
      method: 'post',
      success: function (res) {
        if (res.data.Error == 0) {
          var loginUser = wx.getStorageSync('loginUser');
          loginUser.mobile = that.data.mobile;
          loginUser.password = that.data.password;
          loginUser.style = 2;
          wx.setStorageSync('loginUser', loginUser);
          wx.redirectTo({
            url: '../personal/personal?openId=' + loginUser.openId//跳转去个人中心页面
          });
        }
        else if (res.data.Error == 1) {
          that.showTopTips('还没有注册哦');
          setTimeout(function () {
            wx.navigateTo({
              url: '../regist/regist?type=1'//跳转去注册页面
            });
          }, 3000)
        }
        else if (res.data.Error == 2) {
          that.showTopTips('密码错误');
        }
        else if (res.data.Error == 3) {
          that.showTopTips('您还未成为商户');
          setTimeout(function () {
            wx.navigateTo({
              url: '../regist/regist?type=1'//跳转去注册页面
            });
          }, 3000)
        }
      }
    });
  },
  forgetPassword: function () {
    wx.navigateTo({
      url: '../regist/regist?type=2'//跳转去重置密码页面
    });
  }
})