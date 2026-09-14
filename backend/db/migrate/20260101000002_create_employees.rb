class CreateEmployees < ActiveRecord::Migration[7.1]
  def change
    create_table :employees do |t|
      t.string :name, null: false
      t.string :employee_id, null: false
      t.string :email, null: false
      t.string :password_digest, null: false
      t.integer :role, null: false, default: 0
      t.references :cluster, null: false, foreign_key: true

      t.timestamps
    end
    add_index :employees, :employee_id, unique: true
    add_index :employees, :email, unique: true
  end
end
