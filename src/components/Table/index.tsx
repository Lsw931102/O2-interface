import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Center, Image, Box, Stack, Flex, SimpleGrid, Grid, GridItem } from '@chakra-ui/react'
import orderby from 'lodash.orderby'

import NoData from '@/components/NoData'

import px2vw from '@/utils/px2vw'
import { turn } from '@/theme/animations'

import type {
  IProps,
  SortItem,
  TableEmptyProps,
  TableSortProps,
  TOrder,
  TableDataProps,
  TableHeaderItemProps,
} from './type'

import tableSortIcon from '@/assets/images/svg/tableSortIcon.svg'
import rightArrow from '@/assets/images/svg/rightArrow.svg'
import tableLoadingIcon from '@/assets/images/tableLoadingIcon.png'

export const TableHeaderItem = ({
  record,
  align,
  sortList,
  updateSortList,
}: TableHeaderItemProps) => {
  return (
    <Stack
      key={record.dataIndex}
      width={record?.width ? { base: px2vw(record.width), xl: `${record.width}px` } : 'inherit'}
      textAlign={record.align || align}
      direction="row"
      spacing={{ base: px2vw(7), md: '7px' }}
      justifyContent={record.align || align || 'center'}
      alignItems="center"
    >
      <Box textStyle="12" fontWeight="700">
        {record?.renderTitle ? record.renderTitle(record.title) : record.title}
      </Box>

      {record.sort && (
        <TableSort
          sortList={sortList}
          sortClick={updateSortList}
          dataIndex={record?.sortKey || record.dataIndex}
        />
      )}
    </Stack>
  )
}

export const TableData = ({
  record,
  columns,
  contentStylesProps,
  align,
  RowActiveArrowProps,
  RowActiveNode,
  onRowClick,
}: TableDataProps) => {
  const [isActive, setActive] = useState(false)

  const activePan = () => {
    onRowClick && onRowClick()
    if (!isActive) {
      RowActiveNode && setActive(true)
    } else {
      RowActiveNode && setActive(false)
    }
  }

  return (
    <Grid
      position="relative"
      templateColumns={`repeat(${columns.length}, 1fr)`}
      onClick={(e) => {
        e.stopPropagation()
        activePan()
      }}
      padding={{
        base: px2vw(15),
        xl: '15px',
      }}
      // height={{ md: '60px' }}
      marginBottom={{ base: px2vw(10), xl: '15px' }}
      // width="100%"
      opacity="1" //TODO 在外层改为设置loading
      backgroundColor="grey.275"
      textStyle="16"
      lineHeight={{ base: px2vw(30), xl: '30px' }}
      color="white"
      borderRadius="llg"
      _hover={{
        backgroundColor: 'grey.400',
      }}
      {...contentStylesProps}
    >
      {columns.map((cItem, index2, columnsArr) => {
        return (
          <GridItem colSpan={1} key={`dc${cItem.dataIndex}${index2}`}>
            <Flex
              height="100%"
              width={
                cItem?.width ? { base: px2vw(cItem.width), xl: `${cItem.width}px` } : 'inherit'
              }
              textAlign={cItem.align || align || 'center'}
              justifyContent={cItem.align || align || 'center'}
              alignItems="center"
              whiteSpace="nowrap"
              borderRadius={
                index2 === 0
                  ? { base: `${px2vw(16)} 0 0 ${px2vw(16)}`, xl: '16px 0 0 16px' }
                  : index2 === columnsArr.length - 1
                  ? '0 16px 16px 0'
                  : '0'
              }
            >
              {cItem.render
                ? cItem.render(record[cItem.dataIndex], record, index2)
                : record[cItem.dataIndex] || '--'}
            </Flex>
          </GridItem>
        )
      })}

      <Image
        onClick={(e) => {
          e.stopPropagation()
          activePan()
        }}
        display={RowActiveNode ? 'initial' : 'none'}
        position="absolute"
        top={{ base: 'initial', xl: '24px' }}
        bottom={{ base: px2vw(8), xl: 'initial' }}
        left={{ base: `calc(50% - ${px2vw(5)})`, xl: 'initial' }}
        right={{ base: 'initial', xl: '25px' }}
        transform={{
          base: `${isActive ? 'rotate(270deg)' : 'rotate(90deg)'}`,
          xl: `${isActive ? 'rotate(90deg)' : 'inherit'}`,
        }}
        ignoreFallback
        src={rightArrow}
        {...RowActiveArrowProps}
      />

      {isActive && (
        <GridItem
          onClick={(e) => {
            e.stopPropagation()
          }}
          colSpan={columns.length}
          // marginTop="-15px"
          paddingTop={{ base: px2vw(20), xl: '20px' }}
          opacity="1"
          // backgroundColor="gray.200"
          textStyle="16"
          color="white"
        >
          {RowActiveNode && RowActiveNode(record)}
        </GridItem>
      )}
    </Grid>
  )
}

export const TableSort = ({ dataIndex, sortList = [], sortClick }: TableSortProps) => {
  const [order, setOrder] = useState<any>('init')

  const findMemo = useMemo(() => {
    return sortList.find((item) => item.dataIndex === dataIndex)
  }, [dataIndex, sortList])

  useEffect(() => {
    if (order === 'init') return
    sortClick(dataIndex, order)
  }, [dataIndex, order, sortClick])

  useEffect(() => {
    if (!findMemo) {
      setOrder('init')
    }
  }, [dataIndex, findMemo, sortList])
  return (
    <Flex
      direction="column"
      opacity={order === 'init' || order === 'reset' ? '0.7' : '1'}
      onClick={() => {
        switch (order) {
          case 'init':
            setOrder('asc')
            break
          case 'reset':
            setOrder('asc')
            break
          case 'asc':
            setOrder('desc')
            break
          case 'desc':
            setOrder('reset')
            break
          default:
            break
        }
      }}
      _hover={{
        cursor: 'pointer',
      }}
    >
      <Image opacity={order === 'desc' ? '0.3' : '1'} src={tableSortIcon} ignoreFallback />
      <Image
        opacity={order === 'asc' ? '0.3' : '1'}
        marginTop={{ base: px2vw(2), xl: '2px' }}
        transform="rotate(180deg)"
        src={tableSortIcon}
        ignoreFallback
      />
    </Flex>
  )
}

export const TableLoading = ({
  loadingIcon,
  loading,
}: {
  loadingIcon: string
  loading: boolean
}) => {
  return (
    <Center
      width="100%"
      height="100%"
      minHeight={{ base: px2vw(150), xl: '150px' }}
      padding={{
        base: `${px2vw(15)} ${px2vw(20)} ${px2vw(15)} ${px2vw(20)}`,
        xl: `20px`,
      }}
      // height={{ md: '60px' }}
      marginBottom={{ base: px2vw(10), xl: '15px' }}
      // width="100%"
      opacity={loading ? '0.3' : '1'}
      backgroundColor="gray.200"
      textStyle="16"
      lineHeight={{ base: px2vw(30), xl: '30px' }}
      color="white"
      borderRadius="xl"
      _hover={{
        boxShadow: '0px 0px 6px rgba(255, 255, 255, 0.25)',
      }}
    >
      <Image
        width={{ base: px2vw(30), xl: '30px' }}
        height={{ base: px2vw(30), xl: '30px' }}
        src={loadingIcon}
        alt="loading"
        animation={`${turn} 3s linear infinite`}
        ignoreFallback
      />
    </Center>
  )
}

export const TableEmpty = ({ loading, renderEmpty }: TableEmptyProps) => {
  return (
    <Center
      width="100%"
      height="100%"
      minHeight={{ base: px2vw(150), xl: '150px' }}
      padding={{
        base: `${px2vw(15)} ${px2vw(20)} ${px2vw(15)} ${px2vw(20)}`,
        xl: `20px`,
      }}
      // height={{ md: '60px' }}
      marginBottom={{ base: px2vw(10), xl: '15px' }}
      // width="100%"
      opacity={loading ? '0.3' : '1'}
      backgroundColor="gray.200"
      textStyle="16"
      lineHeight={{ base: px2vw(30), xl: '30px' }}
      color="white"
      borderRadius="xl"
      _hover={{
        boxShadow: '0px 0px 6px rgba(255, 255, 255, 0.25)',
      }}
    >
      {renderEmpty ? renderEmpty() : <NoData />}
    </Center>
  )
}

function Index({
  dataSource,
  columns = [],
  loading = false,
  loadingIcon = tableLoadingIcon,
  align = 'left',
  rowKey = 'key',
  contentStylesProps,
  RowActiveArrowProps,
  containerStyleProps,
  headerStylesProps,
  onRowClick,
  RowActiveNode,
  renderEmpty,
}: IProps) {
  // 数据源
  const [dataSourceState, setDataSourceState] = useState<any>(null)
  // 排序保存的数据
  const [sortList, setSortList] = useState<SortItem[]>([])

  const updateDataSource = () => {
    let newDataSource
    const dataIndexs = sortList.map((item) => item.dataIndex)
    const orders = sortList.map((item) => item.order)
    const isReset = orders.find((item) => item === 'reset')
    if (dataIndexs.length > 0 && !isReset) {
      newDataSource = orderby(dataSource, dataIndexs, orders as any)
    } else {
      newDataSource = dataSource
    }
    setDataSourceState(newDataSource)
  }

  const updateSortList = useCallback((dataIndex: string, order: TOrder | 'init') => {
    const newItem = {
      dataIndex: dataIndex,
      order: order,
    }

    setSortList([newItem])
  }, [])

  useEffect(() => {
    if (dataSource) {
      updateDataSource()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource, sortList])

  const renderContent = () => {
    if (loading || !dataSourceState) {
      return <TableLoading loadingIcon={loadingIcon} loading={loading} />
    }
    if (Array.isArray(dataSourceState) && dataSourceState.length > 0) {
      return (
        <Box opacity={loading ? '0.3' : '1'}>
          {(dataSourceState || []).map((item: { [x: string]: any }) => {
            return (
              <TableData
                key={`${item?.[rowKey]}`}
                record={item}
                columns={columns}
                contentStylesProps={contentStylesProps}
                align={align}
                RowActiveArrowProps={RowActiveArrowProps}
                onRowClick={onRowClick}
                RowActiveNode={RowActiveNode}
              />
            )
          })}
        </Box>
      )
    } else {
      return (
        <TableEmpty
          emptyIcon={loadingIcon}
          columns={columns}
          loading={loading}
          renderEmpty={renderEmpty}
        />
      )
    }
  }

  return (
    /** Table默认为sample样式，需要给table传入variant进行修改  */
    <Box width="100%" {...containerStyleProps}>
      {/* Table Header */}
      <SimpleGrid
        padding={{
          base: `${px2vw(0)} ${px2vw(20)} ${px2vw(0)} ${px2vw(15)}`,
          xl: `0 15px`,
        }}
        marginBottom={{ base: px2vw(10), xl: '10px' }}
        columns={columns.length}
        whiteSpace="nowrap"
        textStyle="12"
        color="white"
        {...headerStylesProps}
      >
        {columns.map((item) => {
          return (
            <TableHeaderItem
              key={item.dataIndex}
              record={item}
              align={align}
              sortList={sortList}
              updateSortList={updateSortList}
            />
          )
        })}
      </SimpleGrid>

      {renderContent()}
    </Box>
  )
}
export default Index
