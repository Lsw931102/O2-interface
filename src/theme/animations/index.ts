import { keyframes } from '@chakra-ui/react'

// ❤️的魔力转圈圈
export const turn = keyframes`
0% {
    transform: rotate(0deg);
}

25% {
    transform: rotate(90deg);
}

50% {
    transform: rotate(180deg);
}

75% {
    transform: rotate(270deg);
}

100% {
     transform: rotate(360deg);
}
`
// 渐隐渐出
export const fade = keyframes`
 0%{
     opacity:0
 }
 50%{
    opacity:1
 }
 100%{
     opacity:0
 }
`
