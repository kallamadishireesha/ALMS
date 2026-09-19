class AddBranchToEmployees < ActiveRecord::Migration[7.1]
  def change
    # Nullable: existing employees (e.g. the seeded EMP-2201) predate
    # branches and don't have one. New signups are required to pick a
    # branch at the controller level (AuthController#signup).
    add_reference :employees, :branch, null: true, foreign_key: true
  end
end
