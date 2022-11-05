/**
 *
 *  pont不支持v1的swagger,因此手写
 *
 */
import Ajax from '@/utils/request'
const baseUrl = 'https://gateway.api.01defi.com/base'
const ajax = new Ajax(baseUrl)

// 获取官网公告
export const getOfficialData = {
  fetcher: (params: Record<string, any>) => ajax.get('/official/data', params),
  key: '/official/data',
}
