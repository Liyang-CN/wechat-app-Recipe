// pages/type/type.js
let { TB } = require('../../utils/config')
let api = require('../../utils/api')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    types: [], // 初始化菜谱分类列表
    page: 1,
    pageSize: 12, // 初始化页面偏移量
    loadBuffer: true
  },
  onLoad() {
    // 提示数据加载中
    wx.showToast({
      title: '数据加载中...',
      icon: 'none'
    })
    this.getTypePage()
  },
  async getTypePage() {
    let { page, pageSize } = this.data
    let findStatus = await api.findPage(TB.CF, page, pageSize)
    // console.log(findStatus);
    // 判断是否能下拉
    if (findStatus.data.length < pageSize) {
      this.setData({ loadBuffer: false })
    }
    this.setData({
      types: this.data.types.concat(findStatus.data)
    })
    // 关闭loading
    wx.hideLoading()
  },
  // 下拉触底时
  onReachBottom() {
    // console.log('触底了');
    // 再次请求数据 page自加1
    if (this.data.loadBuffer) {
      wx.showLoading({
        title: '数据拉取中...',
        icon: 'none'
      })
      ++this.data.page
      setTimeout(() => {
        this.getTypePage()
      }, 500);
    }
  },
  // 从分类跳转到菜谱列表页
  toRecipe(e) {
    let { id, name } = e.currentTarget.dataset
    // console.log(id, name);
    wx.navigateTo({
      url: '../list/list?id='+id+'&name='+name,
    })
  }


})