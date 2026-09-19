class Cluster < ApplicationRecord
  has_many :employees, dependent: :restrict_with_error
  has_many :branches, dependent: :restrict_with_error

  validates :name, presence: true, uniqueness: true
  validates :location, presence: true
end
