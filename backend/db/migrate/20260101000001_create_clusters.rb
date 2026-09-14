class CreateClusters < ActiveRecord::Migration[7.1]
  def change
    create_table :clusters do |t|
      t.string :name, null: false
      t.string :location, null: false

      t.timestamps
    end
    add_index :clusters, :name, unique: true
  end
end
