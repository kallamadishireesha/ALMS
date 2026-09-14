Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      post "auth/signup", to: "auth#signup"
      post "auth/signin", to: "auth#signin"
      get  "me", to: "auth#me"

      resources :clusters, only: [:index]
      resources :leads, only: [:index, :show, :create, :update, :destroy] do
        post :bulk_create, on: :collection
      end
      get "dashboard", to: "dashboard#index"
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
