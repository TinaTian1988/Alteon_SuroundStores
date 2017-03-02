// pages/personal/personal.js
var app = getApp();
var sliderWidth = 96; //96; // 需要设置slider的宽度，用于计算中间位置
Page({
  data: {
    showTopTips: false,//是否显示错误提示
    errorMsg: '',//错误提示

    height: 0,
    headHeight: 0,
    bodyHeight: 0,
    backgroundImg: '',

    tabs: ["图册", "资料"],
    activeIndex: "0",
    sliderOffset: 0,
    navWidth: 0,

    currentImageUrl: '',
    previewImageUrls: null,

    userType: 2,//用户类型：1用户；2商家，默认为商家
    avatarUrl: '',
    nickName: '',

    mobile: '123123',

    userId: 0,
    adverContents: null,

    company: '',
    weixinAccount: '',//微信账号
    qq: '',//QQ
    email: '',
    address: '地址'
  },
  onLoad: function (options) {
    var loginUser = wx.getStorageSync("loginUser");
    if (!options.openId) {
      options.openId = loginUser.openId;
    }
    //判断进入该页面的用户身份

    if (options.openId == loginUser.openId && loginUser.style != 2) {
      wx.navigateTo({
        url: '../login/login'
      });
      return;
    }
    wx.request({
      url: app.globalData.baseUrl + '/API/GetUserByOpenId',
      data: { openId: options.openId },
      method: 'post',
      header: { 'content-type': 'application/json' },
      success: function (res) {
        if (res.data.Error == 0) {
          var data = res.data.Data;
          if (options.openId == loginUser.openId && data.Style == 2) {
            if (data.State == 1) {
              that.showTopTips('Logo还在审核中...');
              that.setData({
                userType: 2
              });
            }
            else if (data.State == 2) {
              that.showTopTips('账号已被禁用');
              that.setData({
                userType: 1
              });
            }
            else if (data.State == 0) {
              that.setData({
                userType: 2
              });
            }
            if (that.data.userType == 2) {
              if (!data.Logo) {
                wx.showModal({
                  title: '提示',
                  content: '上传一张logo吧，才能在首页被发现',
                  success: function (res) {
                    if (res.confirm) {
                      that.UploadImage();
                    }
                  }
                });
              }
            }
            //如果用户的微信头像和昵称更改了，同步头像和昵称
            if (data.HeadPortrait != loginUser.avatarUrl || data.Name != loginUser.nickName) {
              wx.request({
                url: app.globalData.baseUrl + '/API/UpdateUserInfo',
                data: {
                  openId: options.openId,
                  head: loginUser.avatarUrl,
                  name: loginUser.nickName
                },
                method: 'post',
                header: { 'content-type': 'application/json' },
                success: function (res) {
                  if (res.data.Error == 0) {
                    that.setData({
                      avatarUrl: loginUser.avatarUrl,
                      nickName: loginUser.nickName
                    });
                  }
                }
              })
            }
          }
          else {
            that.setData({
              userType: 1
            });
          }
          that.setData({
            avatarUrl: data.HeadPortrait,
            nickName: (!data.Name) ? '' : data.Name,
            address: data.Address,
            mobile: data.Account,
            userId: data.Id,
            backgroundImg: (!data.Logo) ? '' : app.globalData.baseUrl + data.Logo,
            weixinAccount: data.WeiXin,
            qq: data.QQ,
            email: data.Email,
            company: data.Company
          });
          //加载内容
          loadAdverContent(that);
        }
        else {
          console.log('no data');
        }


      },
      fail: function () {
        that.showTopTips('网络异常，请返回重试');
      },
      complete: function () {
        wx.hideToast();
      }
    });




    wx.showToast({
      title: 'loading...',
      icon: 'loading',
      duration: 10000
    });
    //按比例设置高度
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          height: res.windowHeight,
          headHeight: res.windowHeight * 0.35,
          bodyHeight: res.windowHeight * 0.65,
          navWidth: res.windowWidth / that.data.tabs.length
        });
      }
    });








  },
  //tab切换事件
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  preview: function (e) {
    console.log(e);
  },
  //本人操作：预览或删除图片
  showOption: function (e) {
    this.data.currentImageUrl = e.target.dataset.url;
    var aid = e.target.dataset.aid;
    var that = this;
    wx.showActionSheet({
      itemList: ['查看原图', '发布图文', '删除'],
      success: function (res) {
        if (!res.cancel) {
          if (res.tapIndex == 0) {//预览图片
            previewImage(that);
          }
          else if (res.tapIndex == 1) {//跳转去上传图片页面
            wx.navigateTo({
              url: '../uploadImage/uploadImage?id=' + that.data.userId
            });
          }
          //else if (res.tapIndex == 2) {//跳转去上传视频页面
          //  wx.navigateTo({
          //    url: '../uploadVideo/uploadVideo?id=' + that.data.userId
          //  });
          //}
          else if (res.tapIndex == 2) {//删除图片
            wx.showModal({
              title: '删除提醒',
              content: '删除的是整条信息，是否确认删除？',
              confirmText: "确认",
              cancelText: "取消",
              success: function (res) {
                if (res.confirm) {
                  wx.request({
                    url: app.globalData.baseUrl + '/API/DeletAdverByAId',
                    data: { aId: aid },
                    method: 'post',
                    header: { 'content-type': 'application/json' },
                    success: function (res) {
                      loadAdverContent(that);
                    }
                  });
                }
                else {
                  console.log('用户取消了操作')
                }
              }
            });
          }
        }
      }
    });
  },
  //非本人操作只能预览图片
  showImage: function (e) {
    this.data.currentImageUrl = e.target.dataset.url;
    previewImage(this);
  },
  //拨打电话
  makePhoneCall: function () {
    wx.makePhoneCall({
      phoneNumber: this.data.mobile,
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    })
  },
  //去多图上传页面
  gotoUploadImage: function () {
    wx.navigateTo({
      url: '../uploadImage/uploadImage?id=' + this.data.userId
    });
  },
  //上传logo(单张图片)
  UploadImage: function () {
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        wx.uploadFile({
          url: app.globalData.baseUrl + '/API/UpLoadLogo',
          filePath: tempFilePaths[0],
          name: 'logo',
          formData: {
            'openId': wx.getStorageSync('openId'),
            'fileName': tempFilePaths[0]
          },
          success: function (res) {
            var _result = JSON.parse(res.data);
            if (_result.Error == 0) {
              that.setData({ backgroundImg: tempFilePaths[0] });
              that.showTopTips('Logo已上传，请等待审核');
            }
          }
        })
      }
    })
  },
  //获取用户输入介绍信息
  getIntro: function (e) {
    var _input = e.detail.value;
    this.setData({
      address: _input
    });

  },
  //更改手机号码
  updateMobile: function (e) {
    var _input = e.detail.value;
    if (_input.length != 11) {
      return;
    }
    var regMobile = /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
    if (!regMobile.test(_input)) {
      this.showTopTips('请输入正确的手机号码');
      return;
    }
    if (this.data.mobile != _input) {
      var that = this;
      wx.showModal({
        title: '变更提醒',
        content: '该手机号码即为登录手机号码，确认修改吗？',
        confirmText: "确认",
        cancelText: "取消",
        success: function (res) {
          console.log(res);
          if (res.confirm) {
            console.log('用户点击主操作');
            wx.request({
              url: app.globalData.baseUrl + '/API/UpdateMobile',
              data: {
                openId: wx.getStorageSync("loginUser").openId,
                mobile: _input
              },
              method: 'post',
              header: { 'content-type': 'application/json' },
              success: function (res) {
                if (res.data.Error == 0) {
                  that.setData({
                    mobile: _input,
                  });
                  that.showTopTips('修改成功');
                }
                else {
                  that.showTopTips('操作失败，请刷新后重试');
                }
              },
            });
          }
          else {
            console.log('用户取消了操作')
          }
        }
      });
    }
  },
  getCompany: function (e) {
    this.setData({
      company: e.detail.value.trim()
    });
  },
  getWeixinAccount: function (e) {
    this.setData({
      weixinAccount: e.detail.value.trim()
    });
  },
  getQQ: function (e) {
    this.setData({
      qq: e.detail.value.trim()
    });
  },
  getEmail: function (e) {
    this.setData({
      email: e.detail.value.trim()
    });
  },
  getAddress: function (e) {
    this.setData({
      address: e.detail.value.trim()
    });
  },
  //更改介绍信息
  updateInfo: function () {
    var that = this;
    wx.request({
      url: app.globalData.baseUrl + '/API/UpdateUserIntro',
      data: {
        userId: this.data.userId,
        company: this.data.company,
        weixinAccount: this.data.weixinAccount,
        qq: this.data.qq,
        email: this.data.email,
        address: this.data.address,
      },
      method: 'post',
      header: { 'content-type': 'application/json' },
      success: function (res) {
        if (res.data.Error == 0) {
          that.showTopTips('修改成功');
        }
        else {
          that.showTopTips('操作失败，请刷新后重试');
        }
      },
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







//预览图片
var previewImage = function (that) {
  wx.previewImage({
    current: that.data.currentImageUrl, // 当前显示图片的http链接
    urls: that.data.previewImageUrls // 需要预览的图片http链接列表
  });
}

var loadAdverContent = function (that) {
  wx.request({
    url: app.globalData.baseUrl + '/API/GetAdverByUserId',
    data: { userId: that.data.userId },
    method: 'post',
    header: { 'content-type': 'application/json' },
    success: function (res) {
      if (res.data.Error == 0) {
        var _images = res.data.Data2;
        var _data = res.data.Data;
        for (var i = 0; i < _images.length; i++) {
          _images[i] = app.globalData.baseUrl + _images[i];
        }
        for (var i = 0; i < _data.length; i++) {
          for (var j = 0; j < _data[i].Content.length; j++) {
            _data[i].Content[j].Content = app.globalData.baseUrl + _data[i].Content[j].Content;
          }
        }
        that.setData({
          previewImageUrls: _images,
          adverContents: _data
        });
      }
    }
  })
}