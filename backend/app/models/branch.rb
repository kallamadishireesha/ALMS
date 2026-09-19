class Branch < ApplicationRecord
  belongs_to :cluster
  has_many :employees, dependent: :restrict_with_error

  validates :name, presence: true, uniqueness: { scope: :cluster_id }
end
