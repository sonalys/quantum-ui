import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine-dark.css";

import { AgGridReact } from 'ag-grid-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ColDef, ColumnResizedEvent, GridOptions } from 'ag-grid-community';
import sync, { MainDataSync } from 'api/sync';
import styled from "styled-components";
import { debounce } from 'utils/func';
import { columnMapping, restoreColumns } from "./columns";
import { torrentFieldMapping } from "./torrent";
import { ContextMenu } from "./context-menu";
import { Torrent } from "types/torrent";

interface props {
  className?: string
}

const Container = styled.div`
  background-color: blue;
  width: 100%;

  .ag-theme-alpine-dark {
    --ag-foreground-color: var(--text);
    --ag-background-color: var(--background);
    --ag-header-foreground-color: var(--text);
    --ag-header-background-color: var(--primary);
    --ag-odd-row-background-color: var(--secondary);
    --ag-header-column-resize-handle-color: var(--text);

    --ag-font-size: 17px;
    --ag-font-family: monospace;
  }

  .ag-cell {
    padding: 10px !important;
  }
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
  const [ctxMenuTarget, setContextMenu] = useState<any>();
  console.info("grid rendered");

  const updateData = useCallback(() => Object.values(tMap.current).map(torrentFieldMapping), []);

  const mergeTorrent = useCallback((t: Partial<Torrent>) => tMap.current[t.infohash_v1] = {
    ...tMap.current[t.infohash_v1],
    ...t,
  }, []);

  const handleData = useCallback(({ torrents, torrents_removed, rid }: MainDataSync) => {
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
    api.setRowData(updateData());
  }, [updateData]);

  const onColumnChanged = debounce(({ api, source }: ColumnResizedEvent) => {
    if (source === "flex") return;
    const def = (api.getColumnDefs() as ColDef[]).map(columnMapping);
    localStorage.columnsConfig = JSON.stringify(def);
    console.info("persisting column changes");
  });

  const onGridReady = useCallback(() => {
    const { api } = gridRef.current;
    if (!isDefault) return
    console.info("auto sizing columns");
    api.sizeColumnsToFit();
  }, []);

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
    return () => {
      clearInterval(timer);
    };
  }, [handleData]);

  const contextMenu = useCallback(() => {
    if (!ctxMenuTarget) return;
    const { event, data, api } = ctxMenuTarget;
    return <ContextMenu
      top={event.pageY}
      left={event.pageX}
      torrent={data}
      setRowData={(data: Partial<Torrent>) => {
        mergeTorrent(data);
        api.setRowData(updateData());
      }}
      hide={() => { setContextMenu(null) }} />;
  }, [ctxMenuTarget, updateData, mergeTorrent]);

  return <Container className={`${className} ag-theme-alpine-dark`}>
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
        onCellContextMenu: setContextMenu,
        onGridReady,
      }} />
    {contextMenu()}
  </Container>;
};

export default Grid;