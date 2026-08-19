import PropTypes from "prop-types";
import { Table } from "react-bootstrap";
import { useTable, useSortBy } from "react-table";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/24/outline";
import "./style/Table.scss";

const ReactTable = ({ data, columns }) => {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data }, useSortBy);

  return (
    <div className="table-container">
      <Table hover responsive {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup, hgIdx) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={hgIdx}>
              {headerGroup.headers.map((column, colIdx) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  key={colIdx}
                >
                  <div className="header-sort-wrapper">
                    <span>{column.render("Header")}</span>
                    <span className="sort-icon-box">
                      {column.isSorted ? (
                        column.isSortedDesc ? (
                          <ChevronDownIcon width={14} className="sort-icon active" />
                        ) : (
                          <ChevronUpIcon width={14} className="sort-icon active" />
                        )
                      ) : (
                        <ChevronUpDownIcon width={16} className="sort-icon" />
                      )}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, rIdx) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} key={rIdx}>
                {row.cells.map((cell, cIdx) => (
                  <td {...cell.getCellProps()} key={cIdx}>
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

ReactTable.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  delteButton: PropTypes.bool,
};

export default ReactTable;
