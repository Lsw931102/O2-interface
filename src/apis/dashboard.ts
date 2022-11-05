import Ajax from '@/utils/request'
const baseUrl = 'https://gateway.api.01defi.com/api'
const ajax = new Ajax(baseUrl)

// 获取amount
export const getBorrowAndLendDetailInfo = {
  fetcher: (params: Record<string, any>) => ajax.post('/getBorrowAndLendDetail', params),
  key: '/getBorrowAndLendDetail',
}
