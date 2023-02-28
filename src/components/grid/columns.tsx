import styled from "styled-components";
import { ColDef } from "ag-grid-community";
import { GridTorrentData } from "types/torrent";
import { Completed, Downloading, Paused } from "components/icons";
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

  height: 15px;
  width: 15px;
`;

// StatusRenderer is a component renderer for the status cell, receiving state and returning a svg icon for each state.
const StatusRenderer = ({ data }: StatusRendererProps) => {
  let SVG;
  let action;
  switch (data.state) {
    case "pausedUP":
      SVG = Completed;
      action = "resume"
      break;
    case "pausedDL":
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

const maxETA = 8640000; // 100 days is the maximum value returned from qBitTorrent api.

const etaRenderer = ({ value }): string => value === maxETA ? "∞" : moment.duration(value, "seconds").humanize();
const addedOnRenderer = ({ value }) => moment.unix(value).calendar();
const sizeRenderer = ({ value }) => getByteSize(value);
const speedRenderer = ({ value }) => getByteSize(value) + "/s";
const categoryRenderer = ({ value }) => value === "" ? "-" : value;
// TODO: create a better name renderer so we can have encoding / resolution / source tags properly rendered.
const nameRenderer = ({ value }: { value: string }) => value.replaceAll(/(\[.*?\])|(\.\w{3}$)|((h|x)26(4|5))/ig, "").replaceAll(/[_\-.]/g, " ");
const progressRenderer = ({ value }: { value: number }) => (value * 100).toPrecision(4) + "%";
const availabilityRenderer = ({ value }: { value: number }) => value === -1 ? "-" : progressRenderer({ value });

type ColDict = { [Key: string]: ColDef };

export const defaultColDef: ColDef = {
  minWidth: 10,
  resizable: true,
  sortable: true,
  suppressMovable: true,
};

const defaultColumnsDesktop = {
  "status": { headerName: "Status", field: "status", cellRenderer: StatusRenderer, initialWidth: 80, headerClass: "center", cellClass: "center" },
  "name": { headerName: "Name", field: "name", flex: 2, initialWidth: 400, minWidth: 70, cellRenderer: nameRenderer },
  "size": { headerName: "Size", field: "size", initialWidth: 110, cellRenderer: sizeRenderer },
  "progress": { headerName: "Progress", field: "progress", initialWidth: 50, cellRenderer: progressRenderer },
  "num_seeds": { headerName: "Seeds", field: "num_seeds", initialWidth: 30 },
  "num_leechs": { headerName: "Peers", field: "num_leechs", initialWidth: 30 },
  "dlspeed": { headerName: "↓", field: "dlspeed", initialWidth: 80, cellRenderer: speedRenderer },
  "upspeed": { headerName: "↑", field: "upspeed", initialWidth: 80, cellRenderer: speedRenderer },
  "eta": { headerName: "ETA", field: "eta", initialWidth: 100, cellRenderer: etaRenderer },
  "category": { headerName: "Category", field: "category", initialWidth: 100, cellRenderer: categoryRenderer },
  "added_on": { headerName: "Added On", field: "added_on", initialWidth: 150, minWidth: 100, cellRenderer: addedOnRenderer },
  "availability": { headerName: "Availability", field: "availability", initialWidth: 70, cellRenderer: availabilityRenderer },
  "infohash_v1": { headerName: "Hash", field: "infohash_v1", hide: true },
} as ColDict;

const defaultColumnsMobile = {
  "status": defaultColumnsDesktop["status"],
  "name": defaultColumnsDesktop["name"],
  "dlspeed": defaultColumnsDesktop["dlspeed"],
  "upspeed": defaultColumnsDesktop["upspeed"],
  "size": defaultColumnsDesktop["size"],
  "infohash_v1": defaultColumnsDesktop["infohash_v1"],
} as ColDict;


const columnsDesktopList: ColDef[] = Object.values(defaultColumnsDesktop);
const columnsMobileList: ColDef[] = Object.values(defaultColumnsMobile);

export const restoreColumns = (t: screenType): ({ cols: ColDef[], isDefault: boolean }) => {
  let columns: string, defaultCols: ColDict;
  switch (t) {
    case "mobile":
      // TODO: restore the persistence.
      //columns = localStorage.columnsMobile;
      defaultCols = defaultColumnsMobile;
      if (!columns) {
        return { cols: columnsMobileList, isDefault: true }
      }
      break;
    case "desktop":
      columns = localStorage.columnsConfig;
      defaultCols = defaultColumnsDesktop;
      if (!columns) {
        return { cols: columnsDesktopList, isDefault: true }
      }
      break;
  }
  console.info("loading persisted columns");
  const def = (JSON.parse(columns) as ColDef[]).map(storedCol => ({ ...defaultCols[storedCol.field], ...storedCol }));
  return { cols: def, isDefault: false };
}

// columnMapping is used to map current ag-grid column configuration to a local configuration,
// filtering only the fields we want to persist.
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