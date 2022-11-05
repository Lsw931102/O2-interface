import { ComponentStyleConfig } from '@chakra-ui/react'

export default <ComponentStyleConfig>{
  baseStyle: {
    _focus: { boxShadow: 'none', outline: 'none' },
    _focusVisible: {
      outline: 'none',
      boxShadow: 'none',
    },

    _hover: {
      cursor: 'pointer',
      opacity: '0.7',
    },
    _loading: {
      // bgColor: 'gray.200',
      opacity: '0.7',
    },
  },
}
