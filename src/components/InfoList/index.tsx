import React from 'react'
import { Flex, Text, VStack, FlexProps, StackProps } from '@chakra-ui/react'
import { InfoItemProps } from '@/components/ModalTab'
import px2vw from '@/utils/px2vw'

export interface InfolistProps extends StackProps {
  data: InfoItemProps[]
}

export interface CosInfoItemProps extends FlexProps, InfoItemProps {
  labelColor?: string
  labelRender?: () => React.ReactNode
  valueRender?: () => React.ReactNode
}

export const InfoItem = React.memo(
  ({ labelColor, label, value, labelRender, valueRender, ...styleProps }: CosInfoItemProps) => {
    return (
      <Flex
        textStyle="14"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        fontWeight="500"
        {...styleProps}
      >
        {labelRender ? labelRender() : <Text color={labelColor}>{label}</Text>}

        {valueRender ? valueRender() : <Text fontWeight="500">{value}</Text>}
      </Flex>
    )
  }
)

function Index({ data, ...stackProps }: InfolistProps) {
  return (
    <VStack spacing={{ base: px2vw(15), xl: '15px' }} {...stackProps}>
      {data.map((item, index) => {
        if (item) {
          return <InfoItem key={index} {...item} />
        }
      })}
    </VStack>
  )
}
export default React.memo(Index)
