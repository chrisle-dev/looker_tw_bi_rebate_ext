project_name: "tw_bi_rebate_extension"

application: tw_bi_rebate_extension {
  label: "TW BI Rebate Extension"
  file: "dist/bundle.js"
  mount_points: {
    dashboard_vis: yes
    dashboard_tile: yes
    standalone: yes
  }
  entitlements: {
    core_api_methods: ["me"]
  }
}
