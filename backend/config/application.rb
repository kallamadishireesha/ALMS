require_relative "boot"

require "rails"
require "active_model/railtie"
require "active_record/railtie"
require "action_controller/railtie"

Bundler.require(*Rails.groups)

module Alms
  class Application < Rails::Application
    config.load_defaults 7.1
    config.api_only = true
    config.time_zone = "Asia/Kolkata"
    config.active_record.default_timezone = :local

    # This app was hand-scaffolded (not via `rails new`), so `lib/` was
    # never added to the autoload paths. `lib/json_web_token.rb` (and
    # anything else placed in lib/) needs this to be autoloaded by Zeitwerk.
    config.autoload_lib(ignore: %w[tasks])

    # Avoids needing config/master.key for local/dev setup. Override
    # SECRET_KEY_BASE in production via an environment variable.
    config.secret_key_base = ENV.fetch("SECRET_KEY_BASE", "alms_development_insecure_secret_key_base_change_me")

    config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins ENV.fetch("ALMS_FRONTEND_ORIGIN", "http://localhost:5173")
        resource "/api/*",
          headers: :any,
          methods: [:get, :post, :put, :patch, :delete, :options, :head],
          expose: ["Authorization"]
      end
    end
  end
end
