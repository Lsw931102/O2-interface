import {
  Pagination,
  usePagination,
  //   PaginationPage,
  PaginationNext,
  PaginationPrevious,
  //   PaginationPageGroup,
  PaginationContainer,
  //   PaginationSeparator,
} from '@ajna/pagination'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'

const PaginationApp = ({ pageIndex, pageSize, onPageChange, pagesCount }: any) => {
  const { currentPage, setCurrentPage } = usePagination({
    limits: {
      outer: 2,
      inner: 2,
    },
    initialState: {
      pageSize,
      currentPage: pageIndex,
    },
    pagesCount,
  })
  const handlePageChange = (nextPage: number): void => {
    setCurrentPage(nextPage)
    onPageChange(nextPage)
  }

  return (
    <Pagination pagesCount={pagesCount} currentPage={currentPage} onPageChange={handlePageChange}>
      <PaginationContainer align="center">
        <PaginationPrevious
          _hover={{
            bg: 'gray.300',
          }}
          bg="gray.400"
          onClick={() =>
            console.log('Im executing my own function along with Previous component functionality')
          }
          px="0"
          mr="10px"
        >
          <ChevronLeftIcon fontSize="24" />
        </PaginationPrevious>
        <PaginationNext
          _hover={{
            bg: 'gray.300',
          }}
          bg="gray.400"
          onClick={() =>
            console.log('Im executing my own function along with Next component functionality')
          }
          px="0"
        >
          <ChevronRightIcon fontSize="24" />
        </PaginationNext>
      </PaginationContainer>
    </Pagination>
  )
}

export default PaginationApp
