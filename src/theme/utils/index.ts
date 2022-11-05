import { BoxProps } from '@chakra-ui/react'

export const buttonHover = {
  opacity: 0.7,
  cursor: 'pointer',
}

// 单行文本溢出
export const ellipsis: BoxProps = {
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
}
