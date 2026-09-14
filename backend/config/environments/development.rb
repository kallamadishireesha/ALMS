require "active_support/core_ext/integer/time"

Rails.application.configure do
  config.cache_classes = false
  config.eager_load = false
  config.consider_all_requests_local = true
  config.server_timing = true
  config.active_support.deprecation = :log
  config.active_record.migration_error = :page_load
  config.active_record.verbose_query_logs = true
  config.log_level = :debug

  # Rails' Host Authorization middleware blocks requests whose Host header
  # it doesn't recognize (a DNS-rebinding protection). That includes any
  # ngrok tunnel domain by default, so exposing this dev server via ngrok
  # gets a 403 "Blocked hosts" page instead of reaching the app. Allow any
  # ngrok-free.app subdomain so this keeps working even when the tunnel's
  # random URL changes on restart. Dev-only — never do this in production.
  config.hosts << /.*\.ngrok-free\.app/
end
