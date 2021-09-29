data1 = from(bucket: "iobroker")
  |> range(start: -40y)

data2 = from(bucket: "iobroker_labels_per_stateID")
  |> range(start: -40y)
  |> drop(columns: ["_start", "_stop", "_time", "_value", "_field"]) 

data3 = join(
  tables: {t1: data1, t2: data2},
  on: ["_measurement"]
)

data3
  |> range(start: -40y)
  |> fill(value: '')
  |> drop(columns: ["_start", "_stop", "_field", "ack", "from", "_measurement"])
  |> filter(fn: (r) => r["id"] =~ /${id:regex}/ or "all" == "${id}")
  |> filter(fn: (r) => r["name"] =~ /${name:regex}/ or "all" == "${name}")
  |> filter(fn: (r) => r["adapterName"] =~ /${adapterName:regex}/ or "all" == "${adapterName}")
  |> filter(fn: (r) => r["channelName"] =~ /${channelName:regex}/ or "all" == "${channelName}")
  |> filter(fn: (r) => r["deviceName"] =~ /${deviceName:regex}/ or "all" == "${deviceName}")
  |> filter(fn: (r) => r["role"] =~ /${role:regex}/ or "all" == "${role}")
  |> filter(fn: (r) => r["function"] =~ /${function:regex}/ or "all" == "${function}")
  |> filter(fn: (r) => r["room"] =~ /${room:regex}/ or "all" == "${room}")