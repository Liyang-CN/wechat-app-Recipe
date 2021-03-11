// pages/my/my.js
let db = wx.cloud.database();
// 引入模块
let {
  TB,
  adminOpenid
} = require('../../utils/config')
let api = require('../../utils/api')
Page({
  // 跳转到发布页
  pbrecipe() {
    wx.navigateTo({
      url: '../pbrecipe/pbrecipe',
    })
  },
  /**
   * 页面的初始数据
   */
  data: {
    isLogin: true,
    userInfo: {},
    isAdmin: true,
    myRecipe: [],
    myFollow: [],
    selectIndex: 0,
    page: 1,
    pageSize: 4,
    dataBuffer: true,
    loadBuffer: true
  },
  // 点击登录
  wxlogin(e) {
    // console.log(e);
    // 先看看是否授权
    if (e.detail.errMsg != "getUserInfo:ok") {
      wx.showToast({
        title: '请先授权',
        icon: 'none'
      })
      return
    }
    // 执行登录
    wx.login({
      success: async res => {
        let userInfo = e.detail.userInfo;
        // 通过云函数获取当前用户的openid
        let userLogin = await api.yun('myLogin')
        let userOpenid = userLogin.result.openid
        // 根据userOpenid查询数据库
        let userData = await api.findWhere(TB.U, {
          _openid: userOpenid
        })
        if (userData.data.length == 0) {
          // 没查询到 说明是第一次登录 将信息存到数据库里，显示登陆成功
          let addStatus = await api.addOne(TB.U, {
            userInfo
          })
          // 如果返回的addStatus里有_id 说明添加成功了 这里做一下判断
          if (addStatus._id) {
            wx.showToast({
              title: '登陆成功!',
            })
            this.resetData(userInfo, userOpenid, userOpenid == adminOpenid ? true : false);
          } else {
            wx.showToast({
              title: '登录失败!',
              icon: "none"
            })
          }
        } else {
          // 查询到了 显示欢迎回来
          wx.showToast({
            title: '欢迎回来！',
            icon: 'none'
          })
          this.resetData(userInfo, userOpenid, userOpenid == adminOpenid ? true : false)
          this.getMyRecipe()
        }
      }
    })
  },

  // 重新赋值函数
  resetData(userInfo, openid, isAdmin) {
    this.setData({
      isLogin: true,
      userInfo
    })
    // 将数据缓存到本地
    wx.setStorageSync('userInfo', userInfo)
    wx.setStorageSync('openid', openid)
    wx.setStorageSync('isAdmin', isAdmin)
  },

  // 前往分类页
  toClassify() {
    if (this.data.isAdmin) {
      // 如果是管理员才可以跳转到分类页
      wx.navigateTo({
        url: '../category/category',
      })
    } else {
      wx.showToast({
        title: '不可跳转',
        icon: "none"
      })
    }
  },
  // 去详情页
  toDetail(e) {
    let id = e.currentTarget.dataset.id
    let name = e.currentTarget.dataset.name
    wx.navigateTo({
      url: '../detail/detail?id=' + id + '&name=' + name,
    })
  },
  onLoad() {},
  onShow() {
    // 检查是否登录
    wx.checkSession({
      success: async (res) => {
        // 如果是登录状态 就把本地存储的用户信息取出来 
        this.setData({
          userInfo: wx.getStorageSync('userInfo'),
          isAdmin: wx.getStorageSync('isAdmin'),
          myRecipe:[]
        })
        // 获取我的菜谱信息
        this.getMyRecipe()
        // 防止闪屏的方法行不通
        // let {
        //   page,
        //   pageSize
        // } = this.data
        // // 根据openid 获取用户发布的菜谱  
        // let getStatus = await api.findPage(TB.RR, page, pageSize, {
        //   _openid: wx.getStorageSync('openid')
        // }, {
        //   fileds: 'time',
        //   sort: 'desc'
        // })
        // if (getStatus.data.length == 0 && page == 1) { // 没数据时 显示没数据
        //   this.setData({
        //     dataBuffer: false
        //   });
        //   return
        // }
        // console.log(this.data.myRecipe);
        // console.log(getStatus.data);
        // getStatus.data.forEach((item, index) => {
        //   if (item !== this.data.myRecipe[index]) {
        //     console.log('数据不同');
        //     this.setData({
        //       myRecipe: getStatus.data
        //     })
        //   }
        // })
      },
      fail: err => {
        // 开启登录按钮
        this.setData({
          isLogin: false
        })
        // 清除本地缓存
        wx.removeStorageSync('userInfo')
        wx.removeStorageSync('openid')
        wx.removeStorageSync('isAdmin')
      }
    })
  },
  changeMenu(e) {
    let index = e.currentTarget.dataset.index
    // 重新赋值各个页面数据
    this.data.page = 1;
    this.data.myRecipe = []
    this.data.myFollow = []
    this.setData({
      loadBuffer: true,
      dataBuffer: true,
      selectIndex: index
    })
    if (index == 0) {
      this.getMyRecipe()
    } else if (index == 1) {
      this.getMyFollow()
    }
  },
  async getMyRecipe() {
    let {
      page,
      pageSize
    } = this.data
    // 根据openid 获取用户发布的菜谱  
    let getStatus = await api.findPage(TB.RR, page, pageSize, {
      _openid: wx.getStorageSync('openid')
    }, {
      fileds: 'time',
      sort: 'desc'
    })
    if (getStatus.data.length == 0 && page == 1) { // 没数据时 显示没数据
      this.setData({
        dataBuffer: false
      });
      return
    }
    // 判断是否能够上拉加载
    if (getStatus.data.length < pageSize) {
      this.setData({
        loadBuffer: false
      })
    }
    // 给页面赋值
    this.setData({
      myRecipe: this.data.myRecipe.concat(getStatus.data)
    })
    // 关闭提示
    wx.hideLoading()
  },
  async getMyFollow() {
    let {
      page,
      pageSize
    } = this.data
    // 根据用户的openid 在follow表里的_openid字段 查找
    let getStatus = await api.findPage(TB.F, page, pageSize, {
      _openid: wx.getStorageSync('openid')
    }, {
      fileds: 'time',
      sort: 'desc'
    })
    // 判断是否有数据
    if (getStatus.data.length == 0 && page == 1) {
      this.setData({
        dataBuffer: false
      });
      return
    }
    // 判断是否可以上拉加载
    if (getStatus.data.length < pageSize) {
      this.setData({
        loadBuffer: false
      })
    }
    // 根据获取到的菜谱recipeid  从菜谱表里获取菜谱的详情数据   
    let followRecipeDetailArr = await this.getRecipeDetail(getStatus.data)
    // 获取到的关注菜谱列表 追加用户信息
    let myFollowData = await api.addUserInfo(followRecipeDetailArr)
    // 赋值
    this.setData({
      myFollow: this.data.myFollow.concat(myFollowData)
    })
    // 关闭加载
    wx.hideLoading()

  },
  // 定义  根据一个菜谱id数组 得到菜谱详情 并将详情信息追加到数组里
  async getRecipeDetail(arr) {
    let promiseArray = arr.map(item => {
      return api.findWhere(TB.RR, {
        _id: item.recipeid
      })
    })
    let newArr = await Promise.all(promiseArray)
    let followRecipeDetailArr = newArr.map(item => {
      return item.data[0]
    })
    return followRecipeDetailArr
  },
  onReachBottom() {
    if (this.data.loadBuffer) {
      wx.showLoading({
        title: '数据加载中...',
      })
    }
    ++this.data.page // 修改页码
    if (this.data.selectIndex == 0) {
      setTimeout(() => {
        this.getMyRecipe()
      }, 500);
    } else if (this.data.selectIndex == 2) {
      setTimeout(() => {
        this.getMyFollow()
      }, 500);
    }
  }

})