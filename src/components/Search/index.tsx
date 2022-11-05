import { Flex, Input, Image, FlexProps, InputProps, ImageProps } from '@chakra-ui/react'
import React from 'react'

import search from '@/assets/images/svg/search.svg'
import px2vw from '@/utils/px2vw'
import { buttonHover } from '@/theme/utils'

export interface SearchProps {
  containerStyleProps?: FlexProps
  inputStyleProps?: InputProps
  icon?: string
  iconStyleProps?: ImageProps
  onSearch: () => void
}

function Index({
  icon = search,
  onSearch,
  containerStyleProps,
  inputStyleProps,
  iconStyleProps,
}: SearchProps) {
  return (
    <Flex
      //   height={{ base: px2vw(30), xl: '30px' }}
      width={{ base: px2vw(120), xl: '120px' }}
      padding={{ base: `${px2vw(5)} ${px2vw(10)}`, xl: '5px 10px' }}
      alignItems="center"
      borderRadius="xl"
      backgroundColor="gray.400"
      {...containerStyleProps}
    >
      <Input
        flex={1}
        variant="unstyled"
        fontSize={{ base: px2vw(14), xl: '14px' }}
        fontWeight="500"
        placeholder="Search"
        textAlign="center"
        _placeholder={{
          color: 'white',
          opacity: '0.5',
        }}
        {...inputStyleProps}
      />
      <Image
        onClick={onSearch}
        width="13px"
        height="13px"
        src={icon}
        ignoreFallback
        _hover={buttonHover}
        {...iconStyleProps}
      />
    </Flex>
  )
}
export default React.memo(Index)
