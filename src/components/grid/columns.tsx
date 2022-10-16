import styled from "styled-components";
import { ColDef } from "ag-grid-community";
import { GridTorrentData } from "types/torrent";
import { Downloading, Paused } from "components/icons";

interface StatusRendererProps {
  data: GridTorrentData
}

const SVGContainer = styled.div`
  align-self: center;
  fill: white;

  display: flex;
  place-content: center;
`;

const StatusRenderer = ({ data }: StatusRendererProps) => {
  let SVG;
  switch (data.state) {
    case "pausedDL":
      SVG = Paused
      break;
    case "downloading":
    case "metaDL":
      SVG = Downloading
      break;
    default:
  }
  return <SVGContainer><SVG /></SVGContainer>
};

const columns = {
  "status": { headerName: "Status", field: "status", cellRenderer: StatusRenderer },
  "name": { headerName: "Name", field: "name" },
  "size": { headerName: "Size", field: "size" },
  "progress": { headerName: "Progress", field: "progress", cellRenderer: ({ value }) => `${value}%` },
  "num_seeds": { headerName: "Seeds", field: "num_seeds" },
  "num_leechs": { headerName: "Peers", field: "num_leechs" },
  "dlspeed": { headerName: "Download", field: "dlspeed" },
  "upspeed": { headerName: "Upload", field: "upspeed" },
  "eta": { headerName: "ETA", field: "eta" },
  "category": { headerName: "Category", field: "category" },
  "added_on": { headerName: "Added On", field: "added_on" },
  "availability": { headerName: "Availability", field: "availability" },
  "hash": { headerName: "Hash", field: "hash", hide: true },
} as { [Key: string]: ColDef };

export const columnMapping = ({ field, width, sort, sortIndex }) => ({ field, width, sort, sortIndex });

const columnsList: ColDef[] = Object.values(columns);

export const restoreColumns = (): ({ cols: ColDef[], isDefault: boolean }) => {
  let { columnsConfig } = localStorage;
  if (!columnsConfig) {
    console.info("initializing default columns");
    return { cols: columnsList, isDefault: true };
  }
  console.info("loading persisted columns");
  const def = JSON.parse(columnsConfig) as ColDef[];
  return { cols: def.map(col => ({ ...columns[col.field], ...col })), isDefault: false };
}