import React, { useState, useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

export interface Column<T> {
  header: string;
  accessor: keyof T;
  sortable?: boolean;
  Cell?: React.FC<{ value: T[keyof T]; row: T }>;
}

export interface Action<T> {
  label: string;
  onClick?: (item: T) => void;
  component?: (item: T) => React.ReactNode;
  variant?:
    | 'default'
    | 'destructive'
    | 'link'
    | 'outline'
    | 'secondary'
    | 'ghost';
}

export interface BulkAction<T extends { id: string | number }> {
  label: string;
  onClick: (selectedIds: Array<T['id']>) => void;
  variant?:
    | 'default'
    | 'destructive'
    | 'link'
    | 'outline'
    | 'secondary'
    | 'ghost';
}

export interface DataTableProps<T extends { id: string | number }> {
  columns: Array<Column<T>>;
  data: T[];
  renderRowActions?: (item: T) => React.ReactNode;
  actions?: {
    individual?: Array<Action<T>>;
    bulk?: Array<BulkAction<T>>;
  };
  onRowSelect?: (selectedIds: Array<T['id']>) => void;
  onBulkAction?: (action: BulkAction<T>, selectedIds: Array<T['id']>) => void;
}

function DataTable<T extends { id: string | number }>({
  columns,
  data,
  renderRowActions,
  actions,
  onRowSelect,
  onBulkAction
}: DataTableProps<T>) {
  const [filterText, setFilterText] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: 'ascending' | 'descending';
  }>({ key: null, direction: 'ascending' });
  const [selectedRows, setSelectedRows] = useState<Array<T['id']>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sortedData = useMemo(() => {
    const sortableItems = [...data];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        if (aValue < bValue)
          return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue)
          return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const filteredData = useMemo(() => {
    return sortedData.filter((item) =>
      columns.some((column) => {
        const value = item[column.accessor];
        return (
          value &&
          value.toString().toLowerCase().includes(filterText.toLowerCase())
        );
      })
    );
  }, [sortedData, filterText, columns]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleSelectRow = (id: T['id']) => {
    const newSelectedRows = selectedRows.includes(id)
      ? selectedRows.filter((rowId) => rowId !== id)
      : [...selectedRows, id];
    setSelectedRows(newSelectedRows);
    onRowSelect?.(newSelectedRows);
  };

  const handleSelectAll = () => {
    if (selectedRows.length === paginatedData.length) {
      setSelectedRows([]);
      onRowSelect?.([]);
    } else {
      const allIds = paginatedData.map((item) => item.id);
      setSelectedRows(allIds);
      onRowSelect?.(allIds);
    }
  };

  const handleSort = (key: keyof T) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleBulkAction = (action: BulkAction<T>) => {
    onBulkAction?.(action, selectedRows);
    setSelectedRows([]);
  };

  return (
    <>
      <div className="flex items-center justify-between my-4">
        <Input
          placeholder="Buscar..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="w-1/3"
        />
      </div>
      {selectedRows.length > 0 && actions?.bulk && (
        <div className="flex space-x-2 my-4">
          {actions.bulk.map((action) => (
            <Button
              key={action.label}
              variant={action.variant || 'default'}
              size="sm"
              onClick={() => handleBulkAction(action)}
            >
              {action.label} Selecionados ({selectedRows.length})
            </Button>
          ))}
        </div>
      )}
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedRows.length === paginatedData.length &&
                    paginatedData.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              {columns.map((column) => (
                <TableHead
                  key={String(column.accessor)}
                  onClick={() => column.sortable && handleSort(column.accessor)}
                  className={`cursor-pointer select-none ${
                    column.sortable ? 'hover:text-gray-800' : ''
                  }`}
                >
                  <div className="flex items-center">
                    {column.header}
                    {sortConfig.key === column.accessor &&
                      (sortConfig.direction === 'ascending' ? (
                        <ChevronUpIcon className="inline-block w-4 h-4 ml-1" />
                      ) : (
                        <ChevronDownIcon className="inline-block w-4 h-4 ml-1" />
                      ))}
                  </div>
                </TableHead>
              ))}
              <TableHead>Ações</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="w-12">
                  <Checkbox
                    checked={selectedRows.includes(item.id)}
                    onCheckedChange={() => handleSelectRow(item.id)}
                  />
                </TableCell>
                {columns.map((column) => (
                  <TableCell key={String(column.accessor)}>
                    {column.Cell ? (
                      <column.Cell value={item[column.accessor]} row={item} />
                    ) : (
                      String(item[column.accessor])
                    )}
                  </TableCell>
                ))}
                <TableCell>
                  {actions?.individual &&
                    actions.individual.map((action) =>
                      action.component ? (
                        <span key={action.label} className="mr-2">
                          {action.component(item)}
                        </span>
                      ) : (
                        <Button
                          key={action.label}
                          variant={action.variant || 'default'}
                          size="sm"
                          onClick={() => action.onClick && action.onClick(item)}
                          className="mr-2"
                        >
                          {action.label}
                        </Button>
                      )
                    )}
                </TableCell>
                <TableCell>
                  {renderRowActions ? renderRowActions(item) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between my-4 text-xs">
        <div>
          Página {currentPage} de{' '}
          {Math.ceil(filteredData.length / itemsPerPage)}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(
                  prev + 1,
                  Math.ceil(filteredData.length / itemsPerPage)
                )
              )
            }
            disabled={
              currentPage === Math.ceil(filteredData.length / itemsPerPage)
            }
          >
            Próximo
          </Button>
        </div>
      </div>
    </>
  );
}

export default DataTable;
