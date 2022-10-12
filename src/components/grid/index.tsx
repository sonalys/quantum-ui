import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";

import { AgGridReact } from 'ag-grid-react';
import { useEffect, useRef } from 'react';
import { ColDef, ColumnResizedEvent, GridOptions } from 'ag-grid-community';
import sync, { MainDataSync } from 'api/sync';
import styled from "styled-components";
import { debounce } from 'utils/func';
import { restoreColumns } from "./columns";
import { torrentFieldMapping } from "./torrent";

interface props {
  className?: string
}

const Container = styled.div`
  background-color: blue;
  width: 100%;
`;

const defaultColDef = {
  minWidth: 50,
  resizable: true,
  sortable: true,
  suppressMovable: true,
};

const gridOptions: GridOptions = {
  preventDefaultOnContextMenu: true,
  allowDragFromColumnsToolPanel: false,
  rowSelection: 'multiple',
  enableRangeSelection: false,
  maintainColumnOrder: true,
  suppressFieldDotNotation: true,
  suppressCellFocus: true,
  suppressRowDrag: true,
};

const { cols, isDefault } = restoreColumns();

const Grid = ({ className }: props) => {
  const gridRef = useRef<AgGridReact>();
  const tMap = useRef({});
  const reqID = useRef(0);
  console.info("grid rendered");

  const handleData = ({ torrents, torrents_removed, rid }: MainDataSync) => {
    const { api } = gridRef.current;
    reqID.current = rid;
    if (!torrents_removed && !torrents) return;
    Object.keys(torrents || {}).forEach(hash => {
      tMap.current[hash] = {
        ...tMap.current[hash],
        ...torrents[hash],
      }
    });
    torrents_removed?.forEach(hash => tMap.current[hash] = undefined);
    api.setRowData(Object.values(tMap.current).map(torrentFieldMapping));
  };

  const onColumnChanged = debounce(({ api, source }: ColumnResizedEvent) => {
    if (source === "flex") return;
    const def = (api.getColumnDefs() as ColDef[]).map(({field, width, sort, sortIndex}) => ({field, width, sort, sortIndex}));
    localStorage.columnsConfig = JSON.stringify(def);
    console.info("persisting column changes");
  });

  const onGridReady = () => {
    const { api } = gridRef.current;
    if (!isDefault) return
    console.info("auto sizing columns");
    //api.sizeColumnsToFit();
  }

  useEffect(() => {
    console.info("initializing grid polling");
    let timer: string | number | NodeJS.Timeout;
    sync(0)
      .then(data => {
        handleData(data);
        const interval = data.server_state.refresh_interval;
        console.log(`setting interval to ${interval}ms`);
        timer = setInterval(() => sync(reqID.current).then(handleData), interval);
      })
      .catch(exception => console.log(exception));
    return () => clearInterval(timer);
  }, []);

  return <Container className={className}>
    <AgGridReact
      ref={gridRef}
      className="grid"
      defaultColDef={defaultColDef}
      columnDefs={cols}
      gridOptions={{
        ...gridOptions,
        columnDefs: cols,
        onColumnResized: onColumnChanged,
        onSortChanged: onColumnChanged,
        onGridReady,
      }} />
  </Container>;
};

export default Grid;