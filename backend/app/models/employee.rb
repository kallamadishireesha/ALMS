class Employee < ApplicationRecord
  has_secure_password

  belongs_to :cluster
  has_many :leads, dependent: :destroy

  # manager: oversees leads across all agents — can view and edit the status
  # of any lead, not just their own (see LeadsController/DashboardController).
  enum role: { support_agent: 0, admin: 1, user: 2, manager: 3 }

  validates :name, presence: true
  validates :employee_id, presence: true, uniqueness: true,
            format: { with: /\A\d+\z/, message: "must contain only numbers" }
  validates :email, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true
  validates :password, length: { minimum: 6 }, allow_nil: true

  def masked_name
    name
  end
end
