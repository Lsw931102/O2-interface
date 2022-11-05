import { Flex, Stack, Box } from '@chakra-ui/react'
import { FC } from 'react'
import { useFormikContext } from 'formik'

import FormControl, { BaseProps } from './FormControl'
import px2vw from '@/utils/px2vw'
import React from 'react'

type TProps = BaseProps & {
  data: Array<{
    key?: string
    label?: string | ((data: any) => any)
    value?: string | ((data: any) => any)
  }>
} & { restList?: any }

export const FormLabelList: FC<TProps> = ({ name, label, data, restList, ...rest }: TProps) => {
  return (
    <FormControl
      name={name}
      label={label}
      restLabel={{ mb: { base: px2vw(10), xl: '10px' } }}
      {...rest}
    >
      <LabelList data={data} restList={restList} />
    </FormControl>
  )
}

export const LabelList = ({
  data,
  restList,
}: {
  data: Array<{
    key?: string
    label?: string | ((data?: any) => any)
    value?: string | ((data?: any) => any)
    bottomRender?: any
  }>
  restList?: any
}) => {
  const { values } = useFormikContext()
  return (
    <Stack
      spacing={{ base: px2vw(10), xl: '10px' }}
      px={{ base: px2vw(10), xl: '10px' }}
      {...restList}
    >
      {Array.isArray(data) &&
        data.map((item) => (
          <Box
            key={
              item?.key ?? (typeof item?.label === 'function' ? item?.label(values) : item?.label)
            }
          >
            <Flex
              justifyContent="space-between"
              textStyle="14"
              lineHeight={{ base: px2vw(18), xl: '18px' }}
            >
              <Flex minW={{ base: px2vw(120), xl: '120px' }} align="left" alignItems="center">
                {typeof item?.label === 'function' ? (
                  <Flex alignItems="center">{item.label(values)}:</Flex>
                ) : item.label ? (
                  `${item.label}:`
                ) : (
                  ''
                )}
              </Flex>
              <Flex className="ellipsis" alignItems="center">
                {typeof item?.value === 'function' ? item.value(values) : item.value ?? '--'}
              </Flex>
            </Flex>
            {item?.bottomRender?.(values)}
          </Box>
        ))}
    </Stack>
  )
}
