export default {
  global: () => {
    return {
      'html, body': {
        fontSize: '14',
        fontWeight: '400',
        color: 'white',
        bg: 'bg',
        w: '100vw',
        minH: '100vh',
      },
      'body::-webkit-scrollbar': {
        display: 'none',
        width: '0 !important',
      },
      body: {
        overflow: '-moz-scrollbars-none',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      },
    }
  },
}
