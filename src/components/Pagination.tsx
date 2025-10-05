import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination = ({ currentPage, totalPages, onPageChange, className = '' }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5; // Số trang hiển thị tối đa

    if (totalPages <= showPages) {
      // Nếu tổng số trang ít, hiển thị tất cả
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logic phức tạp hơn cho nhiều trang
      if (currentPage <= 3) {
        // Gần đầu
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Gần cuối
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Ở giữa
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex items-center justify-center gap-2 mt-8 lg-down:mt-6 md-down:mt-5 sm-down:mt-4 xs-down:mt-3 ${className}`}>
      {/* First Page Button */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md md-down:p-1.5 sm-down:p-1"
        title="Trang đầu"
      >
        <ChevronsLeft className="w-5 h-5 md-down:w-4 md-down:h-4 xs-down:w-3.5 xs-down:h-3.5" />
      </button>

      {/* Previous Page Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md md-down:p-1.5 sm-down:p-1"
        title="Trang trước"
      >
        <ChevronLeft className="w-5 h-5 md-down:w-4 md-down:h-4 xs-down:w-3.5 xs-down:h-3.5" />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1 md-down:gap-0.5">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-gray-500 dark:text-gray-400 md-down:px-2 md-down:py-1.5 sm-down:px-1.5 sm-down:text-sm"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`min-w-[40px] px-3 py-2 rounded-lg border font-medium transition-all duration-200 md-down:min-w-[36px] md-down:px-2.5 md-down:py-1.5 md-down:text-sm sm-down:min-w-[32px] sm-down:px-2 sm-down:text-xs ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg shadow-blue-500/30 scale-110'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Next Page Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md md-down:p-1.5 sm-down:p-1"
        title="Trang sau"
      >
        <ChevronRight className="w-5 h-5 md-down:w-4 md-down:h-4 xs-down:w-3.5 xs-down:h-3.5" />
      </button>

      {/* Last Page Button */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md md-down:p-1.5 sm-down:p-1"
        title="Trang cuối"
      >
        <ChevronsRight className="w-5 h-5 md-down:w-4 md-down:h-4 xs-down:w-3.5 xs-down:h-3.5" />
      </button>
    </div>
  );
};

export default Pagination;
