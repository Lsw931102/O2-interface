import { extendTheme, theme as baseTheme, ThemeConfig } from '@chakra-ui/react'
import { createBreakpoints } from '@chakra-ui/theme-tools'

import styles from './styles'
import borders from './foundations/borders'
import components from './components'
import px2vw from '../utils/px2vw'

const config: ThemeConfig = {}

const breakpoints = createBreakpoints({
  sm: '640px',
  md: '768px',
  lg: '960px',
  xl: '1024px',
})

const colors = {
  ...baseTheme.colors,
  white: '#FFFFFF',
  bg: 'radial-gradient(50% 50% at 50% 50%, #1B2831 0%, #19202A 100%)',
  black: {
    '100': '#3D3F65',
    '200': '#4A4A5D',
    '300': 'rgba(170, 185, 222, 0.3)',
    '400': '#202135',
    '500': 'rgba(0, 0, 0, 0.2)',
    '600': 'rgba(0, 0, 0, 0.1)',
    '700': 'rgba(0,0,0,0.6)',
    border: 'rgba(160, 160, 160, 0.15)',
  },
  gray: {
    '50': 'rgba(255, 255, 255, 0.1)',
    '70': 'rgba(255, 255, 255, 0.3)',
    '100': 'rgba(0, 0, 0, 0.1)',
    '200': 'rgba(0, 0, 0, 0.2)',
    '300': 'rgba(0, 0, 0, 0.3)',
    '400': 'rgba(0, 0, 0, 0.4)',
    '700': 'rgba(0, 0, 0, 0.7)',
  },
  red: {
    '100': '#FF3E3E',
    '200': '#BB227E',
  },
  green: {
    '100': '#4B6075',
    '200': '#3AAF7F',
    '300': '#95A4B5',
    '400': '#00F58E',
    '500': '#75C473',
    '570': 'rgba(91, 188, 165, 0.7)',
    '600': '#5BBCA5',
  },
  purple: {
    '100': '#95A4B5',
    '200': '#8751DE',
    '300': '#95A4B5',
    '400': 'rgba(170, 185, 222, 0.6)',
    '500': '#4B6075',
    '600': '#3D3F65',
    '700': 'rgba(170, 185, 222, 0.5)',
  },
  silver: {
    '100': 'rgba(205, 205, 255, 0.3)',
    '200': 'rgba(255, 255, 255, 0.5)',
  },
  yellow: { '100': '#F5CE81', '200': '#F28F1D' },
  blue: {
    '100': '#03D0EF',
  },
  grey: {
    '50': 'rgba(149, 164, 181, 0.5)',
    '100': '#95A4B5',
    '200': '#4B6075',
    '275': 'rgba(37, 48, 59, 0.75)',
    '300': '#25303B',
    '400': '#324150',
    '450': 'rgba(170, 185, 222, 0.5)',
    '500': '#AAB9DE',
    '600': '#27303A',
    '660': 'rgba(58, 68, 80, 0.6)',
    '700': '#3A4450',
  },
}

const textStyles = {
  '12': {
    fontSize: {
      base: px2vw(12),
      md: '12px',
    },
    lineHeight: {
      base: px2vw(12),
      md: '12px',
    },
  },
  '14': {
    fontSize: {
      base: px2vw(14),
      md: '14px',
    },
    lineHeight: {
      base: px2vw(14),
      md: '14px',
    },
  },
  '16': {
    fontSize: {
      base: px2vw(16),
      md: '16px',
    },
    lineHeight: {
      base: px2vw(16),
      md: '16px',
    },
  },
  '18': {
    fontSize: {
      base: px2vw(18),
      md: '18px',
    },
    lineHeight: {
      base: px2vw(18),
      md: '18px',
    },
  },
  '20': {
    fontSize: {
      base: px2vw(20),
      md: '20px',
    },
    lineHeight: {
      base: px2vw(20),
      md: '20px',
    },
  },
  '22': {
    fontSize: {
      base: px2vw(22),
      md: '22px',
    },
    lineHeight: {
      base: px2vw(22),
      md: '22px',
    },
  },
  '24': {
    fontSize: {
      base: px2vw(24),
      md: '24px',
    },
    lineHeight: {
      base: px2vw(24),
      md: '24px',
    },
  },
  '30': {
    fontSize: {
      base: px2vw(30),
      md: '30px',
    },
    lineHeight: {
      base: px2vw(30),
      md: '30px',
    },
  },
  '36': {
    fontSize: {
      base: px2vw(36),
      md: '36px',
    },
    lineHeight: {
      base: px2vw(36),
      md: '36px',
    },
  },
}

const radii = {
  none: '0',
  ssm: '1px',
  sm: '5px',
  md: '10px',
  sxl: '12px',
  xl: '16px',
  xxl: '30px',
  lg: '18px',
  llg: '20px',
  lllg: '32px',
  round: '50%',
  select: '15px',
  input: '4px',
}

const layerStyles = {}

// https://chakra-ui.com/docs/theming/theme
const theme = extendTheme({
  config,
  colors,
  fonts: {
    body: '"Rubik", "SF Pro Display", "PingFang SC", "Source Han Sans CN", "Microsoft Yahei"',
  },
  sizes: {
    xl: '1080px',
  },
  fontSizes: {
    '12': '12px',
    '14': '14px',
    '16': '16px',
    '18': '18px',
    '24': '24px',
  },
  radii,
  styles,
  borders,
  components,
  breakpoints,
  layerStyles,
  textStyles,
})

export default theme
