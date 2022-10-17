import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine-dark.css";

import { AgGridReact } from 'ag-grid-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ColDef, ColumnResizedEvent, GridOptions } from 'ag-grid-community';
import sync, { MainDataSync } from 'api/sync';
import styled from "styled-components";
import { debounce } from 'utils/func';
import { defaultColDef, restoreColumns, saveColumns } from "./columns";
import { ContextMenu } from "./context-menu";
import { Torrent } from "types/torrent";
import { getScreenType } from "utils/responsivity";

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

  .header-center .ag-header-cell-label {
   justify-content: center;
  }

  .ag-header-cell {
    padding: 0 5px !important;
    user-select: none;
  }

  .ag-cell {
    padding: 10px !important;
  }
`;

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

const Grid = ({ className }: props) => {
  const gridRef = useRef<AgGridReact>();
  const tMap = useRef({});
  const reqID = useRef(0);
  const screenType = useRef(getScreenType(window.innerWidth));
  const [ctxMenuTarget, setContextMenu] = useState<any>();
  const [{ cols, isDefault }, setCols] = useState(restoreColumns(screenType.current));
  console.info("grid rendered");

  useEffect(() => {
    const colUpdateHandler = debounce((e: UIEvent) => {
      const target = e.target as Window;
      const newType = getScreenType(target.innerWidth);
      if (screenType.current === newType) return;
      screenType.current = newType;
      setCols(restoreColumns(newType));
    }, 100);
    window.addEventListener("resize", colUpdateHandler);
    return () => {
      window.removeEventListener("resize", colUpdateHandler);
    };
  }, []);

  const updateData = useCallback(() => Object.values(tMap.current), []);
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
    saveColumns(screenType.current, api.getColumnDefs() as ColDef[]);
  });

  const onGridReady = useCallback(() => {
    const { api } = gridRef.current;
    if (!isDefault) return
    console.info("auto sizing columns");
    api.sizeColumnsToFit();
  }, [isDefault]);

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
        onColumnResized: onColumnChanged,
        onSortChanged: onColumnChanged,
        onCellContextMenu: setContextMenu,
        onGridReady,
      }} />
    {contextMenu()}
  </Container>;
};

export default Grid;