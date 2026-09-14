class CreateLeads < ActiveRecord::Migration[7.1]
  def change
    create_table :leads do |t|
      t.string  :customer_name, null: false
      t.string  :phone_number, null: false
      t.decimal :gold_quantity, precision: 10, scale: 3, default: 0
      t.decimal :amount, precision: 12, scale: 2, default: 0
      t.integer :lead_source, null: false, default: 0
      t.integer :lead_type, null: false, default: 0
      t.integer :status, null: false, default: 0
      t.references :employee, null: false, foreign_key: true

      t.timestamps
    end
    add_index :leads, :status
    add_index :leads, :lead_type
  end
end
