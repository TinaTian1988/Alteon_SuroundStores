// pages/regist/regist.js
var app = getApp();
Page({
  data:{
    option:0,
    title:'',
    desc:'',
    showTopTips: false,//是否显示错误提示
    errorMsg:'',//错误提示
    mobile:'',//用户输入手机号
    validCode:'',//短信验证码
    validCodeSendTimes:0,//验证码发送次数
    isMobileChecked:false,//手机号码检查通过
    isValidCodeWorking:false,//验证码输入有效期
    isValidCodeChecked:false,//验证码检查通过
    txtValid:'获取验证码',
    canSendValidCode:true
  },
  onLoad:function(options){
    if(options.type==1){
      this.setData({
        option:1,
        title:'注册',
        desc:'加入成为商户'
      });
    }
    else if(options.type==2){
      this.setData({
        option:2,
        title:'找回密码',
        desc:''
      });
    }
  },

  //顶部错误提示框
  showTopTips: function(msg){
        var that = this;
        this.setData({
            showTopTips: true,
            errorMsg:msg
        });
        setTimeout(function(){
            that.setData({
                showTopTips: false
            });
        }, 3000);
  },



  //获取用户输入手机号码，并验证手机号码的正确性：
  getMobile:function(e){
    var _input = e.detail.value.trim();
    if(_input.length!=11){
      return;
    }
    var regMobile=/^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
    if(!regMobile.test(_input)){
      this.showTopTips('请输入正确的手机号码');
      return;
    }
    this.setData({
      mobile:_input,
      isMobileChecked:true
    });
  },
  //获取用户输入验证码
  getValidCode:function(e){
    this.data.isValidCodeChecked=false;
    var _input = e.detail.value.trim();
    if(_input.length != 4){
      return;
    }
    if(!this.data.isValidCodeWorking){
      this.showTopTips('请输入有效的验证码');
      return;
    }
    if(_input != this.data.validCode){
      this.showTopTips('验证码错误');
      return;
    }
    this.data.isValidCodeChecked=true;
  },
  //发送手机短信验证码
  getSmsCode:function(){
    if(this.data.mobile==''){
      this.showTopTips('请输入手机号码');
      return;
    }
    if(!this.data.canSendValidCode){
      this.showTopTips('操作太频繁，请稍后再试');
      return;
    }
    if(!this.data.isMobileChecked){
      this.showTopTips('请输入正确的手机号码');
      return;
    }
    if(this.data.validCodeSendTimes>=5){
      this.showTopTips('今日发送条数已超出上限');
      return;
    }
    this.data.validCode = this.range(0,4).map(function(x){
        return Math.floor(Math.random()*10);
    }).join('');
    
    //发起请求
    var that = this;
    wx.request({
      url: app.globalData.baseUrl+'/API/SendSmsCode',
      method:'post',
      data: {
        sendType:1,//1:单发；2：群发
        mobiles:this.data.mobile,
        tempId:9572,//短信模板id
        parameters:this.data.validCode + ',5'
      },
      header: {
          'content-type': 'application/json'
      },
      success: function(res) {
        if(res.data.result==0){//发送成功
          that.data.validCodeSendTimes+=1;
          that.showTopTips('短信已发送成功');
          var count = 60;
          var timer=setInterval(function(){
            if(count>0){
              that.setData({
                txtValid:'剩余'+count+'s',
                canSendValidCode:false
              });
              count-=1;
            }
            else{
              clearInterval(timer);
              that.setData({
                txtValid:'获取验证码',
                canSendValidCode:true
              });
            }
          },1000);
          that.data.isValidCodeWorking=true;
          setTimeout(function(){
            that.data.isValidCodeWorking=false;
          },1000*60*6);//6分钟内有效
        }
        else if(res.data.result==1){//发送失败
          that.showTopTips('今日发送条数已超出上限');
        }
        else{
          that.showTopTips('短信发送失败，请稍后再试');
        }
      }
    })
  },
  //确定注册
  regist:function(){
    if(!this.data.isValidCodeChecked){
      return;
    }
    if(this.data.option==1){//注册
      wx.navigateTo({
        url: '../password/password?mobile='+this.data.mobile+'&type=1'
      });
    }
    if(this.data.option==2){//找回密码
      wx.navigateTo({
        url: '../password/password?mobile='+this.data.mobile+'&type=2'
      });
    }
  },
  //生成随机数
  range:function(start,end){
    var array=[];
    for(var i=start;i<end;++i) array.push(i);
    return array;
  }
})