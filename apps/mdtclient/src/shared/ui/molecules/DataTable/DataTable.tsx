import React from 'react';
import type { DataTableProps } from './DataTable.types';

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  onRowClick,
  className,
}) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        <thead className="bg-secondary-700">
          <tr>
            {columns.map((column, index) => (
              <th 
                key={index} 
                className="px-4 py-2 text-left"
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              className="border-b border-secondary-700 hover:bg-secondary-800 cursor-pointer"
              onClick={() => onRowClick?.(row, rowIndex)}
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="px-4 py-2">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
