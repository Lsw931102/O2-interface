/**
 *
 *  pont不支持v1的swagger,因此手写
 *
 */
import Ajax from '@/utils/request'
const baseUrl = 'https://gateway.api.01defi.com/api'
const ajax = new Ajax(baseUrl)

// 获取日历接口
export const getLoadHistoryList = {
  fetcher: (params: Record<string, any>) => ajax.post('/getLoadHistoryList', params),
  key: '/getLoadHistoryList',
}
