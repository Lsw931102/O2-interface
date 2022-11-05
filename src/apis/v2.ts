/**
 *
 *  pont不支持v1的swagger,因此手写
 *
 */
import Ajax from '@/utils/request'
const baseUrl = 'https://new.v2.api.01defi.com/fluxv2'
const ajax = new Ajax(baseUrl)

// 获取pool列表
export const getPool = {
  fetcher: (params: Record<string, any>) => ajax.get('/farm/actives/new', params),
  key: '/farm/actives/new',
}

// 获取用户持仓列表
export const getOrderList = {
  fetcher: (params: Record<string, any>) => ajax.get('/user/order/list', params),
  key: '/user/order/list',
}

// 获取统计数据
export const getMsg = {
  fetcher: (params: Record<string, any>) => ajax.get('/farm/msg', params),
  key: '/farm/msg',
}

// 获取清算、平仓
export const getBistByStatus = {
  fetcher: (params: Record<string, any>) => {
    return ajax.post('/user/order/listByStatus', params).then((res) => {
      if (res.code === 200) {
        return res.data
      }
      return []
    })
  },
  key: '/user/order/listByStatus',
}
