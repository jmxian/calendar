// components/calendar/calendar.js
const util = require('../../utils/utils.js')
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    eventList:{
      type:Array,
      value:[],
      observer:function(newVal){
        this.setInfo(newVal)
      }
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    weekArr:["周日","周一","周二","周三","周四","周五","周六"],
    year:null,
    month:null,
    dateArr:[],
    day:"",
    firstDay:'',
    lastDay:'',
    spanArr:[],
    show:false,
    //当前时间，有时候是读取服务器端
    curTime: new Date()
  },
  attached: function(){
    this.getDate()
  },
  /**
   * 组件的方法列表
   */
  methods: {
    setInfo(newVal){
      console.log(newVal)
      let dateArr = []
      for (let i = 1; i < this.data.lastDay + 1; i++) {
        let obj = {
          id : i,
          eventListArr:[]
        }
        for(let j = 0;j<newVal.length;j++){
          let day = new Date(newVal[j].date)
          let index = day.getDate()
          if( index == i){
            obj.eventListArr.push(newVal[j])
          }
        }
        dateArr.push(obj)
      }
      let mydate = new Date();
      let day = mydate.getDate();     //几号
      let getDay =  mydate.getDay()   //星期几
      let left = getDay + 1           //左边获取的个数
      let right = 7 - left            //右边获取的个数
      let spanArr = []
      let lastDay= dateArr.length
      //索引几号星期几
      if(day-left>=0 &&day+right<lastDay){
        spanArr = dateArr.slice(day-left,day+right)
      }else{
        if(day-left<0){
          spanArr = dateArr.slice(0,day+right)
        }else if(day+right>lastDay){
          spanArr = dateArr.slice(day-left,lastDay)
        }
      }
      this.setData({
        dateArr:dateArr,
        spanArr: spanArr
      })
    },
    getDate: function (){
      let mydate = new Date();
      let year = mydate.getFullYear();
      let month = mydate.getMonth();
      let months = month + 1;
      this.data.year = year;
      this.data.month = months;
      this.data.day = mydate.getDate();
      var fist = new Date(year, month, 1);
      this.data.firstDay = fist.getDay();
      var last = new Date(year, months, 0); 
      this.data.lastDay = last.getDate();
      this.setData({
        year: this.data.year,
        month: this.data.month,
        day: this.data.day,
        firstDay: this.data.firstDay,
        lastDay: this.data.lastDay
       })
    },
    delete:util.debounce(function(e){
      wx.showLoading({
        title: '正在处理,请稍等',
      })
      let that = this
      if(e.currentTarget.dataset.id){
        const db = wx.cloud.database({});
        db.collection('calendar').doc(e.currentTarget.dataset.id).remove({
          success: res => {
            wx.hideLoading()
            let eventList = that.data.eventList;
            for (let i = 0;i < eventList.length; i++){
              if (eventList[i]._id == e.currentTarget.dataset.id){
                eventList.splice(i,1);
              }
           }
            that.triggerEvent('updataArr',eventList)
            wx.showToast({
              title: '删除成功',
            })
          },
          fail: err => {
            wx.hideLoading()
            wx.showToast({
              icon: 'none',
              title: '删除失败',
            })
            console.error('[数据库] [删除记录] 失败：', err)
          }
        })
      }
    },1000),
    squarecheck:function(e){
      let that =  this
      console.log(e.currentTarget.dataset.id)
      if(that.data.eventList[e.currentTarget.dataset.index].finish == false){
        const db = wx.cloud.database({});
        const cont = db.collection('calendar').doc(e.currentTarget.dataset.id).update({
          data:{
            finish:true
          },
          success: res => {
            let finish = "eventList["+e.currentTarget.dataset.index+"].finish"
            that.setData({
              [finish]:true
            })
            that.triggerEvent('updataArr',that.data.eventList)
            wx.showToast({
              title: '更新成功',
            })
          }
        });
      }
      
    },
    toShow:function(){
      this.setData({
        show:true
      })
    },
    toHide:function(){
      this.setData({
        show:false
      })
    },
    caHandletouchend:function(event){
      console.log(event)
      let tx = this.data.tx
      let ty = this.data.ty
      if (Math.abs(tx) > Math.abs(ty)) {
        //左右方向滑动(tx<0:左滑动,tx>0右滑动)
      }
      else {
        //上下方向滑动,禁止向左或右滑动
        if (ty < 0)
        this.setData({
          show:false
        })
        else if (ty > 0)
        this.setData({
          show:true
        })
      }
    },
    caHandletouchmove:function(event){
      let currentX = event.touches[0].pageX
      let currentY = event.touches[0].pageY
      let tx = currentX - this.data.lastX
      let ty = currentY - this.data.lastY
      //将当前坐标进行保存以进行下一次计算
      this.data.lastX = currentX
      this.data.lastY = currentY
      this.data.tx = tx
      this.data.ty = ty
    },
    caHandletouchtart: function (event) {
      console.log(event)
      // 赋值
      this.data.lastX = event.touches[0].pageX
      this.data.lastY = event.touches[0].pageY
    },
    handletouchend:function(event){
      let arr = this.data.eventList
      console.log(arr)
      let tx = this.data.tx
      let ty = this.data.ty
      // let animation = "eventList["+event.currentTarget.dataset.id+"]"
      
      if (Math.abs(tx) > Math.abs(ty)) {
        //左右方向滑动
        if (tx < 0){
          // console.log("向左滑动") 
          arr[event.currentTarget.dataset.id].animation = "leftSlider";
          this.setData({
            eventList:arr
          })
        }else if (tx > 0){
            arr[event.currentTarget.dataset.id].animation = "rightSlider";
           this.setData({
            eventList:arr
          })
        }
      }
      else {
        //上下方向滑动,禁止向左或右滑动
        if (ty < 0)
        console.log("向上滑动") 
        else if (ty > 0)
        console.log("向下滑动") 
      }
    },
    handletouchmove:function(event){
      let currentX = event.touches[0].pageX
      let currentY = event.touches[0].pageY
      let tx = currentX - this.data.lastX
      let ty = currentY - this.data.lastY
      //将当前坐标进行保存以进行下一次计算
      this.data.lastX = currentX
      this.data.lastY = currentY
      this.data.tx = tx
      this.data.ty = ty
    },
    handletouchtart: function (event) {
      console.log(event)
      // 赋值
      this.data.lastX = event.touches[0].pageX
      this.data.lastY = event.touches[0].pageY
    },
  }
})
