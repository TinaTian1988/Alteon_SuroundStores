//index.js
//获取应用实例
var app = getApp();
Page({
  data: {
    height: 0,
    headHeight: 0,
    bodyHeight: 0,

    inputShowed: false,
    inputVal: "",
    keyword: null,
    searchResult: null,

    userLogos: null,
    specialLogos: null,

    imgUrls: null,
    indicatorDots: true,
    autoplay: true,
    interval: 2000,
    duration: 1000,

    areaId: -1,

    baseUrl: app.globalData.baseUrl
  },
  onLoad: function () {
    wx.showToast({
      title: 'loading...',
      icon: 'loading',
      duration: 10000
    });

    var that = this;

    //获取当前用户信息
    //wx.removeStorageSync('loginUser');
    app.getUserInfo();

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

    //获取用户所在位置，根据所在地显示对应区域的商户
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        console.log("北纬：" + latitude + "  东经：" + longitude);
        //获取数据
        wx.request({
          url: that.data.baseUrl + '/API/GetAdverLogo',
          data: {
            latitude: latitude,
            longitude: longitude,
            pageIndex: 1,
            pageSize: 999
          },
          method: 'post',
          header: { 'content-type': 'application/json' },
          success: function (res) {
            if (res.data.Error == 0) {
              that.setData({
                areaId: res.data.Msg
              });
              for (var i = 0; i < res.data.Data.length; i++) {
                if (res.data.Data[i].Company == null || res.data.Data[i].Company == '') {
                  res.data.Data[i].Company = '';
                }
                else if (res.data.Data[i].Company.length > 13) {
                  res.data.Data[i].Company = res.data.Data[i].Company.substring(0, 12) + '...';
                }
              }
              for (var i = 0; i < res.data.Data2.length; i++) {
                if (res.data.Data2[i].Company == null || res.data.Data2[i].Company == '') {
                  res.data.Data2[i].Company = '';
                }
                else if (res.data.Data2[i].Company.length > 13) {
                  res.data.Data2[i].Company = res.data.Data2[i].Company.substring(0, 12) + '...';
                }
              }
            }
            that.setData({
              userLogos: res.data.Data,
              specialLogos: res.data.Data2,
              imgUrls: res.data.Data3,
              keyword: res.data.Data4
            });
          },
          fail: function (e) {
            console.log(e);
          },
          complete: function () {
            wx.hideToast();
          }
        });
      }
    });
  },
  //点击logo
  bindViewTap: function (e) {
    var loginUser = wx.getStorageSync('loginUser');
    if (!e.target.dataset.openid || !loginUser.openId) {
      return;
    }
    wx.navigateTo({
      url: '../personal/personal?openId=' + e.target.dataset.openid
    })
  },
  //点击加入我们
  joinUs: function () {
    var loginUser = wx.getStorageSync('loginUser');
    if (!loginUser.openId) {
      return;
    }
    var that = this;
    wx.request({
      url: that.data.baseUrl + '/API/GetUserByOpenId',
      data: {
        openId: loginUser.openId
      },
      method: 'post',
      header: { 'content-type': 'application/json' },
      success: function (res) {
        if (res.data.Error != 0 || (res.data.Error == 0 && res.data.Data.Style == 1)) {
          wx.showModal({
            title: '成为商户',
            content: '是否要注册成为商家，加入平台？',
            confirmText: "加入",
            cancelText: "算了",
            success: function (res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: '../regist/regist?type=1'
                })
              }
            }
          });
        }
        if (res.data.Error == 0 && res.data.Data.Style == 2 && loginUser.style != 2) {
          wx.showModal({
            title: '提示',
            content: '您已经是商家了，是否去登录？',
            confirmText: "登录",
            cancelText: "取消",
            success: function (r) {
              if (r.confirm) {
                wx.navigateTo({
                  url: '../login/login?mobile=' + res.data.Data.Account
                })
              }
            }
          });
        }
        if (res.data.Error == 0 && res.data.Data.Style == 2 && loginUser.style === 2) {
          wx.navigateTo({
            url: '../personal/personal?openId=' + loginUser.openId
          })
        }
        
      }
    })
  },

  //搜索框
  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: ""
    });
  },
  inputTyping: function (e) {
    var _val = e.detail.value;
    var _keyword = this.data.keyword;
    var arr = new Array();
    //匹配用户输入的相关项
    for (var i = 0; i < _keyword.length; i++) {
      if (_keyword[i].indexOf(_val) != -1) {
        arr[arr.length] = _keyword[i];
      }
    }
    this.setData({
      inputVal: _val,
      searchResult: arr,
    });
  },
  confirmInput: function (e) {
    var _com = e.target.dataset.name;
    this.setData({
      inputVal: _com
    });
    Search(this.data.areaId, _com);
  },
  search:function(){
    Search(this.data.areaId, this.data.inputVal);
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

var Search = function (_areaId, _keyword) {
  if (!_areaId || !_keyword) {
    return;
  }
  wx.navigateTo({
    url: '../searchResult/searchResult?areaId=' + _areaId + '&keyword=' + _keyword,
  });

}