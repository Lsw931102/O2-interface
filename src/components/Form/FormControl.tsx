import {
  FormControl as ChakraFormControl,
  FormControlProps,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Box,
} from '@chakra-ui/react'
import { useField } from 'formik'
import React, { FC } from 'react'

import px2vw from '@/utils/px2vw'

export interface BaseProps extends FormControlProps {
  name: string
  label?: any
  helperText?: string
  restLabel?: any
}

const FormControl: FC<BaseProps> = (props: BaseProps) => {
  const { children, name, label, helperText, restLabel, ...rest } = props
  const [, { error, touched }] = useField(name)

  return (
    <ChakraFormControl isInvalid={!!error && touched} size="xl" {...rest}>
      {label && (
        <FormLabel
          className="clearfix"
          htmlFor={name}
          mb={{ base: px2vw(8), xl: '8px' }}
          // px={{ base: px2vw(10), xl: '10px' }}
          {...restLabel}
        >
          <Box textStyle="12">{label}</Box>
        </FormLabel>
      )}
      {children}
      {error && (
        <FormErrorMessage
          px={{
            base: px2vw(10),
            xl: '10px',
          }}
        >
          {error}
        </FormErrorMessage>
      )}
      {helperText && (
        <FormHelperText
          px={{
            base: px2vw(10),
            xl: '10px',
          }}
        >
          {helperText}
        </FormHelperText>
      )}
    </ChakraFormControl>
  )
}

export default FormControl
