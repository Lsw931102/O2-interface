import { VStack, StackProps } from '@chakra-ui/layout'

import React from 'react'

export interface DetailInfo extends StackProps {
  data: JSX.Element[]
}

function Index({ data, ...StackProps }: DetailInfo) {
  return (
    <VStack spacing="0px" {...StackProps}>
      {data.map((item) => {
        return item
      })}
    </VStack>
  )
}
export default React.memo(Index)
