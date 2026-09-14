module Api
  module V1
    class ClustersController < ApplicationController
      skip_before_action :authenticate_request, only: [:index]

      # GET /api/v1/clusters
      def index
        render json: Cluster.order(:name).select(:id, :name, :location)
      end
    end
  end
end
