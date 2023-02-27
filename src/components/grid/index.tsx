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
  .ag-root-wrapper {
    border: none;
  }
  .center .ag-header-cell-label {
   justify-content: center;
  }
  .center.ag-cell {
    justify-content: center;
  }
  .ag-header-cell {
    padding: 0 5px !important;
    user-select: none;
  }
  .ag-cell {
    @media (max-width: 720px) {
      font-size: 2.5vw;
    }
    padding: 0 5px !important;
    display: flex;
    align-items: center;
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
  // Reference to ag-grid component.
  const gridRef = useRef<AgGridReact>();
  // State to hold qBittorrent api data, stored by torrent hash.
  const tMap = useRef<{ [hash: string]: Torrent }>({});
  // Counter used to keep track of qBitTorrent upchanges,
  // increments every request to the api.
  const reqID = useRef(0);
  // Define screen type between Desktop or Tablet mode.
  const screenType = useRef(getScreenType(window.innerWidth));
  // Used for controlling context menu in touch screens.
  const [ctxMenuTarget, setContextMenu] = useState<any>();
  // Integration with local storage to configure table columns, sizes, sorting, etc.
  const [{ cols, isDefault }, setCols] = useState(restoreColumns(screenType.current));
  console.info("grid rendered");
  useEffect(() => {
    // This useEffect manages screen resizing logic, hooking itself to window "resize" event.
    // It triggers reconfiguration of the columns based on screen size.
    // Tablet screen and desktop screen have a different number of columns.
    // Updates debouncing every 100ms intervals, because resize event is called too often, and would use a lot of cpu.
    const colUpdateHandler = debounce((e: UIEvent) => {
      const target = e.target as Window;
      const newType = getScreenType(target.innerWidth);
      if (screenType.current === newType) return;
      screenType.current = newType;
      setCols(restoreColumns(newType));
    }, 100);
    window.addEventListener("resize", colUpdateHandler);
    return () => {
      // Remove hook when destructing the component.
      window.removeEventListener("resize", colUpdateHandler);
    };
  }, []);
  const updateData = useCallback(() => Object.values(tMap.current), []);
  const mergeTorrent = useCallback((t: Partial<Torrent>) => tMap.current[t.infohash_v1] = {
    ...tMap.current[t.infohash_v1],
    ...t,
  }, []);
  // Integration with qBitTorrent api polling.
  // It fetches data every f, f set by the qBitTorrent api.
  // It only updates data for ag-grid if any actual torrent changed states.
  const handleData = useCallback(({ torrents, torrents_removed, rid }: MainDataSync) => {
    const { api } = gridRef.current;
    reqID.current = rid;
    if (!torrents_removed && !torrents) return;
    Object.keys(torrents).forEach(hash => {
      tMap.current[hash] = {
        ...tMap.current[hash],
        ...torrents[hash],
        infohash_v1: hash,
      }
    });
    torrents_removed?.forEach(hash => tMap.current[hash] = undefined);
    // api.setRowData(updateData());
    if (rid === 1) {
      api.setRowData(updateData());
    } else {
      api.applyTransaction({ update: updateData() });
    }
  }, [updateData]);
  // onColumnChanged integrates with ag-grid api,
  // persisting events originated from user interaction on columns configuration.
  const onColumnChanged = debounce(({ api, source }: ColumnResizedEvent) => {
    // Source === flex originates from the page rendering the first time, so we ignore that.
    if (source === "flex") return;
    saveColumns(screenType.current, api.getColumnDefs() as ColDef[]);
  });
  // Initialization handler of ag-grid component, if our columnConfiguration is not set yet, we trigger autoSize.
  const onGridReady = useCallback(() => {
    const { api } = gridRef.current;
    if (!isDefault) return
    console.info("auto sizing columns");
    api.sizeColumnsToFit();
  }, [isDefault]);
  // Polling logic for the qBitTorrent api.
  useEffect(() => {
    console.info("initializing grid polling");
    let timer: string | number | NodeJS.Timeout;
    sync(0)
      .then(data => {
        handleData(data);
        const interval = data.server_state.refresh_interval;
        console.info(`setting interval to ${interval}ms`);
        timer = setInterval(() => sync(reqID.current).then(handleData), interval);
      })
      .catch(exception => console.log(exception));
    return () => {
      clearInterval(timer);
    };
  }, [handleData]);
  // ContextMenu component renderer, only renders if the state allows it, at the specified position.
  const contextMenu = useCallback(() => {
    if (!ctxMenuTarget) return;
    const { event, data, api } = ctxMenuTarget;
    return <ContextMenu
      top={event.pageY}
      left={event.pageX}
      torrent={data}
      setRowData={(data: Partial<Torrent>) => {
        mergeTorrent(data);
        api.applyTransaction({ update: updateData() })
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
        getRowId: ({ data }) => data.infohash_v1,
      }} />
    {contextMenu()}
  </Container>;
};

export default Grid;