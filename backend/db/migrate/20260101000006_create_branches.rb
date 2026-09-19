class CreateBranches < ActiveRecord::Migration[7.1]
  def change
    create_table :branches do |t|
      t.string :name, null: false
      t.references :cluster, null: false, foreign_key: true

      t.timestamps
    end
    add_index :branches, [:cluster_id, :name], unique: true
  end
end
