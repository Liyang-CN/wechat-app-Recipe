const { delOne } = require('../../utils/api');
// pages/detail/detail.js
let api = require('../../utils/api')
let { TB } = require('../../utils/config')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: {}, //菜谱详情信息
    isFollow: false, // 是否关注 true为关注 false为未关注
    followId: ""   // 初始化关注数据的id
  },
  async onLoad(options) {
    let id = options.id; // 菜谱id
    let name = options.name
    wx.setNavigationBarTitle({
      title: name,
    })
    // 一进到这个菜谱详情页 就为该条菜谱增加一条访问量 （visitor）
    let editStatus = await api.editOne(TB.RR, id, { visitor: api._.inc(1) })
    // 根据菜谱id查询这条菜谱 
    let recipe = await api.findWhere(TB.RR, { _id: id })
    // 给这个菜谱详情追加用户信息
    let recipeDetail = await api.addUserInfo(recipe.data)  // 这时已经携带了作者信息
    this.setData({ detail: recipeDetail[0] })

    // 判断用户是否关注过菜谱
    // 通过云函数来得到当前用户的openid
    let userOpenId = await api.yun('myLogin') // userOpenId.result.openid
    // 从follow表里查找是否有该openid的数据 有就是关注过 没有就是没有关注过
    let followStatus = await api.findWhere(TB.F, { _openid: userOpenId.result.openid, recipeid: id })
    if (followStatus.data.length != 0) { // 该用户关注过该菜谱
      this.setData({ isFollow: true, followId: followStatus.data[0]._id })
    }
  },
  // 点击关注或取关
  async follow() {
    let { isFollow, detail } = this.data
    let type = 1 // 自定义+1
    if (!isFollow) { // 关注成功
      // 将该条关注信息存进数据库 （某个用户关账了某个菜谱）
      let addStatus = await api.addOne(TB.F, { recipeid: detail._id, time: new Date() })
      this.setData({ followId: addStatus._id })
    } else {  // 取消关注
      type = -1
      // 根据这条信息的id删除（followId）
      let delStatus = await api.delOne(TB.F, this.data.followId)
    }
    // 根据type的值 决定菜谱的关注量 自加一还是自减一
    let editStatus = await api.editOne(TB.RR, detail._id, { follow: api._.inc(type) })
    // 提示用户是否关注成功
    wx.showToast({
      title: !isFollow ? '关注成功' : '已取消关注',
      icon: 'none'
    })

    this.setData({ isFollow: !isFollow })
  },
  // 分享给朋友
  onShareAppMessage: (res) => {
    return {
      title: '云菜谱',
    }
  },
  // 分享到朋友圈
  onShareTimeline(){
    return {
      title:'云菜谱'
    }
  }

})