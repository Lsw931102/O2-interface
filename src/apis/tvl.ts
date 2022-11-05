/**
 *
 *  pont不支持v1的swagger,因此手写
 *
 */
import Ajax from '@/utils/request'
const baseUrl = 'https://gateway.api.01defi.com/base'
const ajax = new Ajax(baseUrl)

// 获取Tvl
export const getTvl = {
  fetcher: () => ajax.get('/fluxTvl/get'),
  key: '/fluxTvl/get',
}
