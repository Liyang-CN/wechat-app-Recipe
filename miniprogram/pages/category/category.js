const api = require("../../utils/api")
const { TB } = require('../../utils/config')
// pages/category/category.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isAdd: false,
    isEdit: false,
    value: "",
    classifyList: [], // 分类列表
    oldData: {},
  },
  addBtn() { this.setData({ isAdd: true }) },
  editBtn(e) {
    let index = e.currentTarget.dataset.index
    this.setData({
      isEdit: true,
      oldData: this.data.classifyList[index],
      value: this.data.classifyList[index].classifyName
    })
  },
  async delBtn(e) {
    let id = e.currentTarget.dataset.id;
    // console.log(id);  
    let delStatus = await api.delOne(TB.CF, id)
    if (delStatus.stats.removed == 1) {
      // 删除成功
      wx.showToast({
        title: '删除成功',
      })
      let index = this.data.classifyList.findIndex(item => { return item._id == id })
      this.data.classifyList.splice(index, 1) // 删除这一项 
      this.setData({ classifyList: this.data.classifyList })
    } else {
      wx.showToast({
        title: '删除失败',
        icon: "none"
      })
    }
  },
  // 添加菜谱分类
  async add() {
    // console.log(this.data.value);
    let { value, classifyList } = this.data
    // 正则
    if (value.trim() == '') { // 判断是否为空
      wx.showToast({
        title: '分类名称不能为空',
        icon: "none"
      }); return
    }
    let index = classifyList.findIndex(item => { return item.classifyName == value }) // 查找名称是否重复
    if (index != -1) {
      wx.showToast({
        title: '分类名称已存在!',
        icon: "none"
      }); return
    }
    // 添加
    let addStatus = await api.addOne(TB.CF, { classifyName: value, time: new Date })
    if (addStatus._id) {
      // 添加成功
      wx.showToast({
        title: '添加成功!',
      })
      this.getList();
      this.resetData();
    } else {// 添加失败
      wx.showToast({
        title: '添加失败!',
        icon: 'none'
      })
    }
  },
  // 得到菜谱列表
  async getList() {
    let listStatus = await api.findAll(TB.CF)
    this.setData({ classifyList: listStatus.data })
  },
  // 修改菜谱分类
  async edit() {
    let { value, oldData } = this.data
    // 正则
    if (value.trim() == "") { // 不能为空
      wx.showToast({
        title: '菜谱名称不能为空！',
        icon: 'none'
      }); return
    }
    if (value == oldData.classifyName) {
      wx.showToast({
        title: '菜谱名称重复！',
        icon: 'none'
      }); return
    }
    // 修改
    let editStatus = await api.editOne(TB.CF, oldData._id, { classifyName: value })
    if (editStatus.stats.updated == 1) {
      //修改成功
      wx.showToast({
        title: '修改成功',
      })
      this.getList()
      this.resetData();
    } else {
      wx.showToast({
        title: '修改失败',
        icon: 'none'
      })
    }

  },
  // 重新赋值
  resetData() {
    this.setData({
      value: "",
      isAdd: false,
      isEdit: false,
      oldData: {}
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})