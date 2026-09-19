module Api
  module V1
    class ClustersController < ApplicationController
      skip_before_action :authenticate_request, only: [:index]

      # GET /api/v1/clusters
      def index
        clusters = Cluster.order(:name).includes(:branches).map do |cluster|
          {
            id: cluster.id,
            name: cluster.name,
            location: cluster.location,
            branches: cluster.branches.order(:name).map { |b| { id: b.id, name: b.name } }
          }
        end

        render json: clusters
      end
    end
  end
end
