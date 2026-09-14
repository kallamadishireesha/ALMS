# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2026_01_01_000004) do
  create_table "clusters", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name", null: false
    t.string "location", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_clusters_on_name", unique: true
  end

  create_table "employees", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name", null: false
    t.string "employee_id", null: false
    t.string "email"
    t.string "password_digest", null: false
    t.integer "role", default: 0, null: false
    t.bigint "cluster_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["cluster_id"], name: "index_employees_on_cluster_id"
    t.index ["email"], name: "index_employees_on_email", unique: true
    t.index ["employee_id"], name: "index_employees_on_employee_id", unique: true
  end

  create_table "leads", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "customer_name", null: false
    t.string "phone_number", null: false
    t.decimal "gold_quantity", precision: 10, scale: 3, default: "0.0"
    t.decimal "amount", precision: 12, scale: 2, default: "0.0"
    t.integer "lead_source", default: 0, null: false
    t.integer "lead_type", default: 0, null: false
    t.integer "status", default: 0, null: false
    t.bigint "employee_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["employee_id"], name: "index_leads_on_employee_id"
    t.index ["lead_type"], name: "index_leads_on_lead_type"
    t.index ["status"], name: "index_leads_on_status"
  end

  add_foreign_key "employees", "clusters"
  add_foreign_key "leads", "employees"
end
