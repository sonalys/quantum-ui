import styled from "styled-components";
import { ColDef } from "ag-grid-community";
import { GridTorrentData } from "types/torrent";
import { Downloading, Paused } from "components/icons";
import { resumePause } from "api/torrents";

interface StatusRendererProps {
  data: GridTorrentData
}

const SVGContainer = styled.div`
  align-self: center;

  fill: white;

  transition: fill .25s;

  :hover {
    fill: #8eb47c;
  }

  :active {
    fill: #555;
  }

  display: flex;
  place-content: center;

  height: 20px;
`;

const StatusRenderer = ({ data }: StatusRendererProps) => {
  let SVG;
  let action;
  switch (data.state) {
    case "pausedDL":
      SVG = Paused
      action = "resume"
      break;
    case "downloading":
    case "metaDL":
      SVG = Downloading
      action = "pause";
      break;
    default:
  }
  return <SVGContainer onClick={() => { resumePause(data.hash, action) }}><SVG /></SVGContainer>
};

const columnsDesktop = {
  "status": { headerName: "Status", field: "status", cellRenderer: StatusRenderer, initialWidth: 30 },
  "name": { headerName: "Name", field: "name", wrapText: true, flex: 2, minWidth: 200 },
  "size": { headerName: "Size", field: "size", initialWidth: 80 },
  "progress": { headerName: "Progress", field: "progress", initialWidth: 90, cellRenderer: ({ value }) => `${value}%` },
  "num_seeds": { headerName: "Seeds", field: "num_seeds", initialWidth: 30 },
  "num_leechs": { headerName: "Peers", field: "num_leechs", initialWidth: 30 },
  "dlspeed": { headerName: "Download", field: "dlspeed", initialWidth: 90 },
  "upspeed": { headerName: "Upload", field: "upspeed", initialWidth: 90 },
  "eta": { headerName: "ETA", field: "eta", initialWidth: 100 },
  "category": { headerName: "Category", field: "category", initialWidth: 100 },
  "added_on": { headerName: "Added On", field: "added_on", initialWidth: 150, minWidth: 150 },
  "availability": { headerName: "Availability", field: "availability", initialWidth: 90 },
  "hash": { headerName: "Hash", field: "hash", hide: true },
} as { [Key: string]: ColDef };

const columnsMobile = {
  "status": { headerName: "Status", field: "status", cellRenderer: StatusRenderer, initialWidth: 30 },
  "name": { headerName: "Name", field: "name", flex: 1 },
  "size": { headerName: "Size", field: "size", width: 60 },
  "hash": { headerName: "Hash", field: "hash", hide: true },
} as { [Key: string]: ColDef };

export const columnMapping = ({ field, width, sort, sortIndex, flex }) => ({ field, width, sort, sortIndex, flex });

const columnsDesktopList: ColDef[] = Object.values(columnsDesktop);
const columnsMobileList: ColDef[] = Object.values(columnsMobile);

export const restoreColumns = (width: number): ({ cols: ColDef[], isDefault: boolean }) => {
  let columns, defaultColumns;
  if (width < 720) {
    columns = localStorage.columnsMobile;
    defaultColumns = columnsMobile;
    if (!columns) {
      return { cols: columnsMobileList, isDefault: true }
    }
  } else {
    columns = localStorage.columnsConfig;
    defaultColumns = columnsDesktop;
    if (!columns) {
      return { cols: columnsDesktopList, isDefault: true }
    }
  }
  console.info("loading persisted columns");
  const def = JSON.parse(columns) as ColDef[];
  return { cols: def.map(col => ({ ...defaultColumns[col.field], ...col })), isDefault: false };
}

export const saveColumns = (width: number, cols : ColDef[]) => {
  const buf = JSON.stringify(cols.map(columnMapping));
  if (width < 720) {
    localStorage.columnsMobile = buf;
  } else {
    localStorage.columnsConfig = buf;
  }
};