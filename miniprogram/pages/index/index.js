//index.js
const app = getApp()
const util = require('../../utils/utils.js')
Page({
  data: {
    date: '',
    title:'',
    time: '',
    start:'',
    end:'',
    index: 0,
    picker: ['bg-red', 'bg-orange', 'bg-yellow','bg-olive','bg-green','bg-cyan','bg-blue','bg-purple','bg-mauve','bg-pink'],
  },

  onLoad: function() {
    this.query()
    let mydate = new Date();
    this.data.date = this.formatTime(mydate.getTime())
    let year = mydate.getFullYear();
    let month = mydate.getMonth();
    let months = month + 1;
    var fist = new Date(year, month, 1);
    this.data.start = fist.getDay();
    var last = new Date(year, months, 0);
    this.data.end = last.getDate();
    this.setData({
      date:this.data.date,
      start:year+'-'+months+'-'+this.data.start,
      end:year+'-'+months+'-'+this.data.end
    })
  },
  getTitle(e){
    this.setData({title:e.detail.value})
  },
  getTime(e){
    this.setData({time:e.detail.value})
  },
  saveData:util.debounce(function(){
    let that = this
    let class_color = this.data.picker[this.data.index]
    let title = this.data.title
    let time = this.data.time
    let date = this.data.date
    let openid = wx.getStorageSync('userInfo').openId
    if (that.data.title == "" || that.data.title == 'None') {
      wx.showToast({
        title: '请输入事件标题',
        icon: 'none',
        duration: 2000
      })
      return;
    }else if(openid == "" || openid== 'None'){
      wx.showToast({
        title: '请授权登录',
        icon: 'none',
        duration: 2000
      })
      return;
    }else if(time == "" || time== 'None'){
      wx.showToast({
        title: '请输入具体时间',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    wx.showLoading({
      title: '正在处理,请稍等',
    })
    //把数据给云数据库
    const db = wx.cloud.database({});
    const cont = db.collection('calendar');
    cont.add({
      data:{
        openid:openid,
        class_color:class_color,
        title:title,
        time:time,
        date:date,
        openid:openid,
        finish:false,
      },
      success: function (res) {
        wx.hideLoading()
        console.log(res._id)
        wx.showModal({
          title: '备忘录',
          content: '您已经成功记录',
          showCancel: false
        })
        that.setData({
          show:false
        })
        that.query()
      }
    })
    
  },2000),
  updataArr(e){
    this.setData({
      event_list:e.detail
    })
  },
  query(){
    const db = wx.cloud.database()
    let openid = wx.getStorageSync('userInfo').openId
    // 查询当前用户所有的 counters
    db.collection('calendar').where({
      openid: openid
    }).get({
      success: res => {
        console.log('[数据库] [查询记录] 成功: ', res)
        this.setData({
          event_list:res.data
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  }, 
  PickerChange(e) {
    console.log(e);
    this.setData({
      index: e.detail.value
    })
  },
  showForm:function(){
    this.setData({
      show:true
    })
  },
  hideForm:function(){
    this.setData({
      show:false
    })
  },
  DateChange(e) {
    this.setData({
      date: e.detail.value
    })
  },
  formatTime:function(date) {
      /* 从Date对象（标准时间格式）返回对应数据 */
      var date = new Date(date);
      let year = date.getFullYear();
      let month = date.getMonth()+1;
      let day = date.getDate();
      let hour = date.getHours();
      let minute = date.getMinutes();
      let second = date.getSeconds();
      return year + '-' + month + '-' + day ;
    }
    
})
