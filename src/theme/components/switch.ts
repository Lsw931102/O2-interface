import { ComponentStyleConfig } from '@chakra-ui/react'

export default <ComponentStyleConfig>{
  baseStyle: {
    track: {
      bg: 'purple.600',
      _focus: {
        boxShadow: 'none',
      },
      _checked: {
        bg: 'purple.500',
      },
    },
    thumb: {
      bg: 'gray.300',
    },
  },
  variants: {
    flux: {
      bg: 'purple.500',
    },
  },
}
