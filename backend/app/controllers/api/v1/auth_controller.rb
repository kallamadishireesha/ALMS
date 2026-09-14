module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authenticate_request, only: [:signup, :signin]

      # Roles a person is allowed to grant themselves at signup. admin/user
      # are deliberately excluded — those aren't self-service roles.
      SELF_SIGNUP_ROLES = %w[support_agent manager].freeze

      # POST /api/v1/auth/signup
      def signup
        cluster = Cluster.find_by(id: signup_params[:cluster_id])
        return render json: { error: "Invalid cluster" }, status: :unprocessable_entity unless cluster

        role = signup_params[:role].to_s
        role = "support_agent" unless SELF_SIGNUP_ROLES.include?(role)

        employee = Employee.new(
          name: signup_params[:name],
          employee_id: signup_params[:employee_id],
          password: signup_params[:password],
          password_confirmation: signup_params[:password_confirmation],
          cluster: cluster,
          role: role
        )

        if employee.save
          render json: auth_payload(employee), status: :created
        else
          render json: { errors: employee.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # POST /api/v1/auth/signin
      def signin
        employee = Employee.find_by(employee_id: params[:employee_id])

        if employee&.authenticate(params[:password])
          render json: auth_payload(employee), status: :ok
        else
          render json: { error: "Invalid employee ID or password" }, status: :unauthorized
        end
      end

      # GET /api/v1/me
      def me
        render json: employee_json(current_employee)
      end

      private

      def signup_params
        params.permit(:name, :email, :cluster_id, :employee_id, :password, :password_confirmation, :role)
      end

      def auth_payload(employee)
        {
          token: JsonWebToken.encode(employee_id: employee.id),
          employee: employee_json(employee)
        }
      end

      def employee_json(employee)
        {
          id: employee.id,
          name: employee.name,
          employee_id: employee.employee_id,
          email: employee.email,
          role: employee.role,
          cluster: { id: employee.cluster.id, name: employee.cluster.name, location: employee.cluster.location }
        }
      end
    end
  end
end
