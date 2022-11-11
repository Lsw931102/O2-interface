import React from 'react'
import { Flex, Text } from '@chakra-ui/react'
import px2vw from '@/utils/px2vw'

export interface IProps {
  date: string
}

function Index({ date }: IProps) {
  const newDate = new Date(date)

  return (
    <Flex my="auto">
      <Flex flexDirection="column" justifyContent="flex-end">
        <Text textStyle="14" fontWeight="bold" color="white" mr={{ base: px2vw(5), xl: '5px' }}>
          {newDate.getFullYear()}-
          {newDate.getMonth() + 1 < 10 ? `0${newDate.getMonth() + 1}` : newDate.getMonth() + 1}-
          {newDate.getDate() < 10 ? `0${newDate.getDate()}` : newDate.getDate()}
        </Text>
      </Flex>
      <Flex flexDirection="column" justifyContent="flex-end">
        <Text textStyle="12" fontWeight="normal" color="white" opacity="0.5">
          {newDate.getHours() < 10 ? `0${newDate.getHours()}` : newDate.getHours()}:
          {newDate.getMinutes() < 10 ? `0${newDate.getMinutes()}` : newDate.getMinutes()}
        </Text>
      </Flex>
    </Flex>
  )
}

export default React.memo(Index)
