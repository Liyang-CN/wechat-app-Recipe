// pages/list/list.js
let { TB } = require('../../utils/config')
let api = require('../../utils/api')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lists: [],
    classifyId: '',
    page: 1,
    pageSize: 5,
    loadBuffer: true,
    dataBuffer: true,
    where: {}
  },
  // 得到菜谱列表
  async getRecipeList() {
    let { page, pageSize, where } = this.data
    let getStatus = await api.findPage(TB.RR, page, pageSize, where)
    // 判断是否有数据
    if (getStatus.data.length == 0 && page == 1) {
      this.setData({ dataBuffer: false })
      wx.hideLoading()
      return;
    }
    // 判断是否可以上拉加载
    if (getStatus.data.length < pageSize) {
      this.setData({ loadBuffer: false })
    }
    // 给得到的数组追加用户信息
    let addUserStatus = await this.addUserInfo(getStatus.data) // 追加过userInfo的菜谱列表信息
    // 给data里的lists赋值
    // this.setData({ lists: this.data.lists.concat(getStatus.data) }) // 弃用
    this.setData({ lists: this.data.lists.concat(addUserStatus) })
    // 关闭加载
    wx.hideLoading()
    // 关闭更新
    wx.stopPullDownRefresh()
  },
  // 根据参数中每一项的openid 在数据库中找到相应的用户信息 并加入到这个参数数组中
  async addUserInfo(arr) {
    let promiseArr = arr.map(item => {
      return api.findWhere(TB.U, { _openid: item._openid })
    })
    let userInfoArr = await Promise.all(promiseArr)
    // userInfo是所有发布菜谱的用户信息数组 并且是有顺序的  需要将userInfo按顺序追加到arr每一项中
    arr.forEach((item, index) => {
      item.userInfo = userInfoArr[index].data[0].userInfo
    })
    return arr
  },
  onLoad(options) {

    wx.showLoading({
      title: '数据加载中...',
    })
    // 获取分类列表的id
    let recipeTypeid = options.id || ''
    // 获取关键字
    let keywords = options.keywords || ''
    let title = options.name || '搜索列表'

    // 动态设置where的查询条件
    let where = {}
    if (keywords == '') { // 没有关键字 说明是从分类列表跳转过来的
      where = { recipeTypeid }
    } else { // 有关键字 就按关键字模糊查询
      where = {
        recipeName: api.db.RegExp({
          regexp: keywords
        })
      }
    }
    // 将where存进data中
    this.data.where = where
    // 动态设置导航栏标题
    wx.setNavigationBarTitle({ title })

  },
  onShow() {
    this.setData({ lists: [] })
    // 根据where申请得到该类菜谱列表
    this.getRecipeList();
  },
  // 上拉加载
  onReachBottom() {
    if (this.data.loadBuffer) {
      wx.showLoading({
        title: '数据加载中...',
      })
      ++this.data.page
      setTimeout(() => {
        this.getRecipeList()
      }, 500);
    }
  },
  // 下拉刷新
  onPullDownRefresh() {
    wx.showLoading({
      title: '正在刷新页面...',
    })
    this.data.page = 1; // 将页面赋值为1
    this.data.lists = []
    // 重新把loadBuffer赋为true
    this.setData({ loadBuffer: true })
    // 重新获取页面
    setTimeout(() => {
      this.getRecipeList()
    }, 500);
  },
  // 去菜谱详情页
  toDetail(e) {
    let id = e.currentTarget.dataset.id
    let name = e.currentTarget.dataset.name
    wx.navigateTo({
      url: '../detail/detail?id=' + id + '&name=' + name,
    })
  },

})