/**
 *
 *  pont不支持v1的swagger,因此手写
 *
 */
import Ajax from '@/utils/request'
const baseUrl = 'https://gateway.api.01defi.com/api'
const ajax = new Ajax(baseUrl)

// 存取借还等历史记录列表
export const getQueryTradeDetailInfoList = {
  fetcher: (params: Record<string, any>) => ajax.post('/queryTradeDetailInfoList', params),
  key: '/queryTradeDetailInfoList',
}

// 清算记录列表
export const getLiqTradeInfo = {
  fetcher: (params: Record<string, any>) => ajax.post('/getLiqTradeInfo', params),
  key: '/getLiqTradeInfo',
}
