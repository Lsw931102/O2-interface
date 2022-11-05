/**
 *
 *  pont不支持v1的swagger,因此手写
 *
 */
import Ajax from '@/utils/request'
const baseUrl = 'https://gateway.api.01defi.com/base'
// const baseUrl = 'http://121.196.26.182:8089/monitor/base'
const ajax = new Ajax(baseUrl)

// 获取公告
export const getNotice = {
  fetcher: (params: Record<string, string>) => ajax.get('/news/get', params),
  key: '/news/get',
}
