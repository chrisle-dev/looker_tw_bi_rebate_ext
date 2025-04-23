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
    core_api_methods: ["me", "all_artifacts", "update_artifacts"]
    use_form_submit: yes
    use_embeds: yes
    use_iframes: yes
    use_downloads: yes
    use_clipboard: yes
    navigation: yes
    new_window: yes
    local_storage: yes
  }
}
