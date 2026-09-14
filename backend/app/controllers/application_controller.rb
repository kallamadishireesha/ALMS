class ApplicationController < ActionController::API
  before_action :authenticate_request

  attr_reader :current_employee

  private

  def authenticate_request
    header = request.headers["Authorization"]
    token = header.split(" ").last if header

    decoded = token && JsonWebToken.decode(token)
    @current_employee = decoded && Employee.find_by(id: decoded[:employee_id])

    render json: { error: "Unauthorized" }, status: :unauthorized unless @current_employee
  end
end
