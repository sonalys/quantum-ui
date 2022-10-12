import { ColDef } from "ag-grid-community";

const columns = {
  "status": { headerName: "Status", field: "status", cellRenderer: () => <div>a</div> },
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
} as { [Key: string]: ColDef };

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