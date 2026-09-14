class MakeEmployeeEmailOptional < ActiveRecord::Migration[7.1]
  def change
    change_column_null :employees, :email, true
  end
end
