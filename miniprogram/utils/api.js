// 数据库对象
let db = wx.cloud.database()
let { TB } = require('./config')
const _ = db.command
/*
  封装云函数yun
  params:{
    table：数据库表名（string）
    where：{}
  }
*/
const yun = (name, data = {}) => {
  return wx.cloud.callFunction({
    name,
    data
  })
}


/*
  查找用户信息:根据where查询一条数据
  params:{
    table：数据库表名（string）
    where：{}
  }
*/
const findWhere = (table, where = {}) => {
  return db.collection(table).where(where).get()
}


/*
  增加一条信息:根据add增加一条数据库信息
  params:{
    table：数据库表名（string）
    where：{}
  }
*/
const addOne = (table, data) => {
  return db.collection(table).add({ data })
}

/*
  得到所有数据
  params:{
    table：数据库表名（string）
  }
*/
const findAll = async (table) => {
  const MAX_LIMIT = 20
  // 先取出集合记录总数
  const countResult = await db.collection(table).count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 20)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = db.collection(table).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  // 等待所有
  return (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  })
}

/*
  得到所有数据
  params:{
    table：数据库表名（string）
    page：页码
    pageSize：分页偏移量
    orderBy：{} 这里是按照时间升序排列  asc升序 desc降序
  }
*/
const findPage = (table, page, pageSize, where = {}, orderBy = { fileds: "time", sort: 'asc' },) => {
  return db.collection(table).where(where).skip((page - 1) * pageSize).limit(pageSize).orderBy(orderBy.fileds, orderBy.sort).get()
}

/*
  根据id，修改一条数据
  params:{
    table：数据库表名（string）,
    id：string,
    data:{}
  }
*/
const editOne = (table, id, data) => {
  return db.collection(table).doc(id).update({ data })
}

/*
  根据id，删除一条数据
  params:{
    table：数据库表名（string）,
    id：string,
    data:{}
  }
*/
const delOne = (table, id) => {
  return db.collection(table).doc(id).remove()
}

// 向一个数组的每项都插入用户信息
const addUserInfo = async (arr) => {
  let promiseArr = arr.map(item => {
    return findWhere("recipe_user", { _openid: item._openid })
  })
  let userInfoArr = await Promise.all(promiseArr)
  // userInfo是所有发布菜谱的用户信息数组 并且是有顺序的  需要将userInfo按顺序追加到arr每一项中
  arr.forEach((item, index) => {
    item.userInfo = userInfoArr[index].data[0].userInfo
  })
  return arr
}




module.exports = {
  db,
  yun,
  _ ,
  findWhere,
  addOne,
  findAll,
  editOne,
  delOne,
  findPage,
  addUserInfo
}