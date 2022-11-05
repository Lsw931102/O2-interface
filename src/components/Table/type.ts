import { ImageProps, BoxProps } from '@chakra-ui/react'
import React from 'react'

export type TAlign = 'center' | 'left' | 'right'
export type TOrder = boolean | 'desc' | 'asc' | 'init' | 'reset'
export interface ColumnItem {
  title: string | string[]
  dataIndex: string
  align?: TAlign
  sort?: boolean //是否开启排序
  width?: number //宽度
  sortKey?: string //排序的key值，适用于自定义render场景
  render?: (text: any, record: any, index: number) => React.ReactNode
  renderTitle?: (title: string | string[]) => React.ReactNode //渲染表头的方法
}
export interface SortItem {
  dataIndex: string
  order: TOrder | 'init'
}
export interface TableEmptyProps {
  emptyIcon?: string
  columns?: ColumnItem[]
  loading?: boolean
  renderEmpty?: () => any
}
export interface IProps {
  renderEmpty?: () => any
  columns: ColumnItem[] //表Fieleds
  dataSource: any[] | null //数据源
  align?: TAlign
  rowKey?: string //设置成key的字段，暂时只支持字符串格式
  loading?: boolean //是否加载
  loadingIcon?: string //加载时候的ICon
  emptyIcon?: string //空状态Icon
  emptyData?: string //空数据文字描述
  RowActiveArrowProps?: ImageProps
  containerStyleProps?: BoxProps
  contentStylesProps?: BoxProps
  headerStylesProps?: BoxProps
  RowActiveNode?: (record: any) => React.ReactNode //单击后显示的元素
  onRowClick?: () => void //单击一行的方法
}

export interface TableSortProps {
  dataIndex: string
  sortList: any[]
  sortClick: (index: string, order: TOrder) => void
}

export interface TableDataProps
  extends Pick<
    IProps,
    | 'columns'
    | 'onRowClick'
    | 'loading'
    | 'contentStylesProps'
    | 'align'
    | 'RowActiveNode'
    | 'RowActiveArrowProps'
  > {
  record: any
}

export interface TableHeaderItemProps {
  record: ColumnItem
  align: IProps['align']
  sortList: SortItem[]
  updateSortList: (dataIndex: string, order: TOrder | 'init') => void
}
