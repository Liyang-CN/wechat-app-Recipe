// pages/search/search.js
let { TB } = require('../../utils/config')
let api = require('../../utils/api')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    value: '', // 初始化关键字
    hotSearch: [], // 热门搜索
    hisSearch: [], // 历史搜索
    hisBuffer: true
  },
  async search(e) {
    let { value } = this.data
    let name = e.currentTarget.dataset.name || '';
    // 判断关键字是否为空
    if (value.trim() == '' && name == '') {
      wx.showToast({
        title: '搜索内容不能为空',
        icon: 'none'
      }); return
    }
    // 关键字 可以是value 也可以是热门搜索 也可以是近期搜索
    let keywords = value == '' ? name : value
    // 判断缓存中是否有关键字
    let hisData = wx.getStorageSync('historySearch') || []
    let index = hisData.findIndex(item => {
      return item == keywords
    })
    if (index == -1) {  // 缓存中没找到该关键字 就存进缓存 保持缓存中始终是最新的六条数据
      // 截取前五条 在最前面加入一条最新的关键字 组成最新的六条数据
      let data = hisData.splice(0, 5);
      data.unshift(keywords)
      wx.setStorageSync('historySearch', data)
    }

    // 跳转到菜谱列表页面
    wx.navigateTo({
      url: '../list/list?keywords=' + keywords,
      success: res => { this.setData({ value: '' }) }
    })

  },
  onLoad() { },
  onShow() {
    this.getHotSearch()
    this.getHisSearch()
  },
  // 获取热门搜索数据：根据菜谱表中 各个菜谱的visitor数量排序 获取九条
  async getHotSearch() {
    let getStatus = await api.findPage(TB.RR, 1, 9, {}, { fileds: 'visitor', sort: 'desc' })
    this.setData({ hotSearch: getStatus.data })
  },
  // 从缓存中获取历史搜索数据
  getHisSearch() {
    let hisSearch = wx.getStorageSync('historySearch')
    if (hisSearch.length == 0) {
      this.setData({ hisBuffer: false })
    } else {
      this.setData({ hisSearch, hisBuffer: true })
    }
  }

})