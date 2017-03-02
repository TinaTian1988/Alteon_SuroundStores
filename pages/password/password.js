// pages/password/password.js
var app = getApp();
Page({
    data: {
        option: 0,
        title: '',
        desc: '',
        showTopTips: false,
        errorMsg: '',
        mobile: '',
        password: '',
        password2: '',
    },
    onLoad: function (a) {
        this.data.mobile = a.mobile;
        if (a.type == 1) {
            this.setData({
                option: 1,
                title: '设置密码',
                desc: '设个密码吧，方便下次登录'
            });
        }
        else if (a.type == 2) {
            this.setData({
                option: 2,
                title: '重置密码',
                desc: '密码要记住哦，不要再忘记啦'
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
    //获取第一次输入的密码
    getPassword: function (e) {
        var _input = e.detail.value;
        if (_input.length < 8) {
            this.showTopTips('密码不能少于8位数');
            return;
        }
        this.setData({
            password: _input
        });
    },
    //获取第二次输入的密码
    getPassword2: function (e) {
        var _input = e.detail.value;
        if (_input.length < 8) {
            return;
        }
        if (_input != this.data.password) {
            this.showTopTips('两次密码输入不一致');
            return;
        }
        if (_input == this.data.password) {
            this.setData({
                password2: _input
            });
        }
    },
    //确定注册
    regist: function () {
        if (this.data.password == '' || this.data.password2 == '' || this.data.password != this.data.password2) {
            return;
        }
        var loginUser = wx.getStorageSync('loginUser');
        //console.log(loginUser);
        //发起请求
        var that = this;
        wx.request({
            url: app.globalData.baseUrl + '/API/Regist',
            method: 'post',
            data: {
                openId: loginUser.openId,
                nickName: loginUser.nickName,
                headImg: loginUser.avatarUrl,
                mobile: this.data.mobile,
                password: this.data.password2,
                style: 2//用户类型：1用户；2商家
            },
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                var loginUser = wx.getStorageSync('loginUser');
                if (res.data.Error == 0) {
                    var loginUser = {
                        mobile: that.data.mobile,
                        password: that.data.password2,
                        openId: loginUser.openId,
                        nickName: loginUser.nickName,
                        avatarUrl: loginUser.avatarUrl,
                        style: 2//用户类型：1用户；2商家
                    };
                    wx.setStorageSync('loginUser', loginUser);
                    if (that.data.option == 1) {
                        that.showTopTips('注册成功');
                        setTimeout(function () {
                            wx.navigateTo({
                                url: '../chooseArea/chooseArea'
                            });
                        }, 3000)
                    }
                    if (that.data.option == 2) {
                        that.showTopTips('密码重置成功');
                        setTimeout(function () {
                            wx.redirectTo({
                                url: '../personal/personal?openId='+loginUser.openId
                            });
                        }, 3000)
                    }
                }
                else if (res.data.Error == 2) {
                    if (that.data.option == 1) {
                        that.showTopTips('已经注册过了');
                    }
                    if (that.data.option == 2) {
                        that.showTopTips('密码重置成功');
                    }
                    setTimeout(function () {
                        wx.redirectTo({
                            url: '../login/login?mobile=' + that.data.mobile//跳转去登录页面
                        });
                    }, 3000)
                }
            }
        });
    }
})