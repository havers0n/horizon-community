export interface DataTableColumn {
  key: string;
  header: string;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface DataTableProps {
  columns: DataTableColumn[];
  data: any[];
  onRowClick?: (row: any, index: number) => void;
  className?: string;
}