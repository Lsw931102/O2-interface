import React from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { Flex, Text, RadioGroup, Radio, Stack, FlexProps } from '@chakra-ui/react'
import px2vw from '@/utils/px2vw'
import { setStore } from '@/utils/storage'
import { spellQuery } from '@/utils/common'

function Index({ ...props }: FlexProps) {
  const { t } = useTranslation()
  const router = useRouter()
  // const [customGas, setCustomGas] = useState('')
  return (
    <Flex
      direction="column"
      w={{ base: 'full', xl: '225px' }}
      bg={{ base: 'bg', xl: 'transparent' }}
      borderBottomLeftRadius={{ base: 'xl', lg: 0 }}
      borderBottomRightRadius={{ base: 'xl', lg: 0 }}
      zIndex={1}
      {...props}
    >
      {/* gas price */}
      {/* <Flex
        direction="column"
        p={{ base: `${px2vw(82)} ${px2vw(25)} ${px2vw(13)}`, xl: '15px' }}
        bg={{ base: 'transparent', xl: 'purple.600' }}
      > */}
      {/* <Text mb={{ base: px2vw(25), xl: '10px' }} textStyle="16" fontWeight="bold">
          {t('Gas')}
        </Text>
        <Flex
          alignItems="center"
          justifyContent="space-between"
          w={{ base: px2vw(305), xl: 'full' }}
        >
          <RadioGroup defaultValue="1">
            <Stack spacing={{ base: px2vw(26), xl: '10px' }} direction="column">
              <Radio
                value="1"
                color="purple.300"
                colorScheme="purple.300"
                borderColor="purple.300"
                _focus={{ boxShadow: 'none' }}
              >
                {t('Fastest')} ~3s
              </Radio>
              <Radio
                value="2"
                color="purple.300"
                colorScheme="purple.300"
                borderColor="purple.300"
                _focus={{ boxShadow: 'none' }}
              >
                {t('Fast')} ~6s
              </Radio>
              <Radio
                value="3"
                color="purple.300"
                colorScheme="purple.300"
                borderColor="purple.300"
                _focus={{ boxShadow: 'none' }}
              >
                {t('Medium1')} ~20s
              </Radio>
            </Stack>
          </RadioGroup>
          <Stack spacing={{ base: px2vw(26), xl: '10px' }} direction="column" alignItems="flex-end">
            <Text fontWeight="normal">12 GWEI</Text>
            <Text fontWeight="normal">10 GWEI</Text>
            <Text fontWeight="normal">6 GWEI</Text>
          </Stack>
        </Flex> */}
      {/* custom */}
      {/* <Flex
          alignItems="center"
          justifyContent="space-between"
          w={{ base: px2vw(305), xl: 'full' }}
          mt={{ base: px2vw(26), xl: '10px' }}
        >
          <Radio
            value="0"
            color="purple.300"
            colorScheme="purple.300"
            borderColor="purple.300"
            _focus={{ boxShadow: 'none' }}
          >
            {t('Custom')}
          </Radio>
          <Input
            value={customGas}
            onChange={(e) => setCustomGas(e.target.value)}
            ml={{ base: px2vw(5), xl: '5px' }}
            w={{ base: px2vw(121), xl: '121px' }}
            h={{ base: px2vw(20), xl: '20px' }}
            p={{ base: px2vw(4), xl: '4px' }}
            color="rgba(255, 255, 255, 0.5)"
            textStyle="14"
            fontWeight="normal"
            bg="gray.400"
            borderRadius="input"
            placeholder="Input Gas Price<300"
            _placeholder={{
              color: 'rgba(255, 255, 255, 0.5)',
              textStyle: '12',
            }}
          />
        </Flex> */}
      {/* </Flex> */}
      {/* language */}
      <Flex
        direction="column"
        // p={{ base: `${px2vw(12)} ${px2vw(25)} ${px2vw(53)}`, xl: '2px 15px 15px' }}
        p={{ base: `${px2vw(53)} ${px2vw(25)} ${px2vw(53)}`, xl: '15px 15px 15px' }}
        bg={{ base: 'gray.200', xl: 'purple.600' }}
        borderBottomLeftRadius="xl"
        borderBottomRightRadius={{ base: 'xl', lg: 0 }}
      >
        <Stack spacing={{ base: px2vw(25), xl: '10px' }} direction="column">
          <Text textStyle="16" fontWeight="bold">
            {t('Language')}
          </Text>
          <RadioGroup
            defaultValue={router.locale}
            onChange={() => {
              const queryStr = spellQuery(router.query)
              router.push(`${router.pathname}?${queryStr}`, undefined, {
                locale: router.locale === 'en' ? 'zh' : 'en',
              })
              setStore('lang', [router.locale === 'en' ? 'zh' : 'en'])
            }}
          >
            <Stack
              spacing={{ base: px2vw(50), xl: '10px' }}
              direction={{ base: 'row', xl: 'column' }}
            >
              <Radio
                value="en"
                fontWeight="normal"
                color="purple.300"
                colorScheme="purple.300"
                borderColor="purple.300"
                _focus={{ boxShadow: 'none' }}
              >
                English
              </Radio>
              <Radio
                value="zh"
                fontWeight="normal"
                color="purple.300"
                colorScheme="purple.300"
                borderColor="purple.300"
                _focus={{ boxShadow: 'none' }}
              >
                简体中文
              </Radio>
            </Stack>
          </RadioGroup>
        </Stack>
      </Flex>
    </Flex>
  )
}

export default React.memo(Index)
