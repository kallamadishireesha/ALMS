require "active_support/core_ext/integer/time"

Rails.application.configure do
  config.cache_classes = true
  config.eager_load = true
  config.consider_all_requests_local = false
  config.log_level = :info
  config.force_ssl = true

  # Rails logs to a file by default; Render's dashboard only shows what's
  # written to stdout, so route logs there to actually be able to see them.
  config.logger = ActiveSupport::Logger.new(STDOUT)
  config.logger.formatter = config.log_formatter
  config.log_tags = [:request_id]

  # Allow Render's own domain (yourapp.onrender.com). Same Host Authorization
  # protection as development — see the ngrok note in development.rb.
  config.hosts << /.*\.onrender\.com/
  config.hosts << ENV["RENDER_EXTERNAL_HOSTNAME"] if ENV["RENDER_EXTERNAL_HOSTNAME"]
end
