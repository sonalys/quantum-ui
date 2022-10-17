import styled from "styled-components";
import { ColDef } from "ag-grid-community";
import { GridTorrentData } from "types/torrent";
import { Downloading, Paused } from "components/icons";
import { resumePause } from "api/torrents";
import { getByteSize } from "utils/bytes";
import moment from "moment";
import { screenType } from "utils/responsivity";

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
    case "pausedUP":
      SVG = Paused
      action = "resume"
      break;
    case "downloading":
    case "metaDL":
    default:
      SVG = Downloading
      action = "pause";
      break;
  }
  return <SVGContainer onClick={() => { resumePause(data.hash, action) }}><SVG /></SVGContainer>
};

const maxETA = 8640000;

const getETA = ({ value }): string => value === maxETA ? "∞" : moment.duration(value, "seconds").humanize();
const getAddedOn = ({ value }) => moment.unix(value).calendar();
const getSize = ({ value }) => getByteSize(value);
const getSpeed = ({ value }) => getByteSize(value) + "/s";
const getCategory = ({ value }) => value === "" ? "-" : value;
const nameParser = ({ value }: { value: string }) => value.replaceAll(/\[.*?\]/g, "").replaceAll(/[_-]/g, " ");

type ColDict = { [Key: string]: ColDef };

export const defaultColDef: ColDef = {
  minWidth: 10,
  resizable: true,
  sortable: true,
  suppressMovable: true,
};

const columnsDesktop = {
  "status": { headerName: "Status", field: "status", cellRenderer: StatusRenderer, initialWidth: 40, headerClass: "header-center" },
  "name": { headerName: "Name", field: "name", flex: 2, initialWidth: 400, minWidth: 100, cellRenderer: nameParser },
  "size": { headerName: "Size", field: "size", initialWidth: 60, cellRenderer: getSize },
  "progress": { headerName: "Progress", field: "progress", initialWidth: 50, cellRenderer: ({ value }) => `${value * 100}%` },
  "num_seeds": { headerName: "Seeds", field: "num_seeds", initialWidth: 30 },
  "num_leechs": { headerName: "Peers", field: "num_leechs", initialWidth: 30 },
  "dlspeed": { headerName: "↓", field: "dlspeed", initialWidth: 50, cellRenderer: getSpeed },
  "upspeed": { headerName: "↑", field: "upspeed", initialWidth: 50, cellRenderer: getSpeed },
  "eta": { headerName: "ETA", field: "eta", initialWidth: 100, cellRenderer: getETA },
  "category": { headerName: "Category", field: "category", initialWidth: 100, cellRenderer: getCategory },
  "added_on": { headerName: "Added On", field: "added_on", initialWidth: 150, minWidth: 100, cellRenderer: getAddedOn },
  "availability": { headerName: "Availability", field: "availability", initialWidth: 70 },
  "infohash_v1": { headerName: "Hash", field: "infohash_v1", hide: true },
} as ColDict;

const columnsMobile = {
  "status": columnsDesktop["status"],
  "name": columnsDesktop["name"],
  "dlspeed": columnsDesktop["dlspeed"],
  "upspeed": columnsDesktop["upspeed"],
  "size": columnsDesktop["size"],
  "infohash_v1": columnsDesktop["infohash_v1"],
} as ColDict;


const columnsDesktopList: ColDef[] = Object.values(columnsDesktop);
const columnsMobileList: ColDef[] = Object.values(columnsMobile);

export const restoreColumns = (t: screenType): ({ cols: ColDef[], isDefault: boolean }) => {
  let columns: string, defaultCols: ColDict;
  switch (t) {
    case "mobile":
      //columns = localStorage.columnsMobile;
      defaultCols = columnsMobile;
      if (!columns) {
        return { cols: columnsMobileList, isDefault: true }
      }
      break;
    case "desktop":
      columns = localStorage.columnsConfig;
      defaultCols = columnsDesktop;
      if (!columns) {
        return { cols: columnsDesktopList, isDefault: true }
      }
      break;
  }
  console.info("loading persisted columns");
  const def = (JSON.parse(columns) as ColDef[]).map(storedCol => ({ ...defaultCols[storedCol.field], ...storedCol }));
  return { cols: def, isDefault: false };
}

const columnMapping = ({ field, width, sort, sortIndex, flex }) => ({ field, width, sort, sortIndex, flex });

export const saveColumns = (t: screenType, cols: ColDef[]) => {
  const buf = JSON.stringify(cols.map(columnMapping));
  switch (t) {
    case "desktop":
      localStorage.columnsConfig = buf;
      break;
    case "mobile":
      localStorage.columnsMobile = buf;
      break;
  }
  console.info("persisting column changes");
};