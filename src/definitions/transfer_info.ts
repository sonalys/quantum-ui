export class ServerState {
  dl_info_speed?: number
  dl_info_data?: number
  up_info_speed?: number
  up_info_data?: number
  dl_rate_limit?: number
  up_rate_limit?: number
  dht_nodes?: number
  connection_status?: string
  alltime_dl?: number
  alltime_ul?: number
  average_time_queue?: number
  free_space_on_disk?: number
  global_ratio?: number
  queued_io_jobs?: number
  queueing?: boolean
  read_cache_hits?: number
  read_cache_overload?: number
  refresh_interval?: number
  total_buffers_size?: number
  total_peer_connections?: number
  total_queued_size?: number
  total_wasted_session?: number
  use_alt_speed_limits?: boolean
  write_cache_overload?: number
};