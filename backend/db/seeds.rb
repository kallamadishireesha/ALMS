puts "Seeding clusters..."
chennai = Cluster.find_or_create_by!(name: "Chennai Central") { |c| c.location = "Chennai, TN" }
bengaluru = Cluster.find_or_create_by!(name: "Bengaluru South") { |c| c.location = "Bengaluru, KA" }

puts "Seeding employee..."
agent = Employee.find_or_create_by!(employee_id: "EMP-2201") do |e|
  e.name = "Arjun Mehta"
  e.email = "arjun.mehta@example.com"
  e.password = "password123"
  e.password_confirmation = "password123"
  e.cluster = chennai
  e.role = :support_agent
end

puts "Seeding leads..."
leads = [
  { customer_name: "Priya Sundaram",   phone_number: "9840000780", gold_quantity: 25.5, amount: 60_000,  lead_source: :online_call,       lead_type: :new_lead,  status: :follow_up_status },
  { customer_name: "Vijay Anand",      phone_number: "9840000122", gold_quantity: 80.0, amount: 250_000, lead_source: :walk_in,           lead_type: :new_lead,  status: :rejected },
  { customer_name: "Ramesh Kumar",     phone_number: "9840000210", gold_quantity: 45.0, amount: 150_000, lead_source: :customer_referral, lead_type: :new_lead,  status: :accepted },
  { customer_name: "Lakshmi Venkatesh",phone_number: "9840000780", gold_quantity: 30.0, amount: 80_000,  lead_source: :online_call,       lead_type: :gl,        status: :follow_up_status }
]

leads.each do |attrs|
  agent.leads.find_or_create_by!(customer_name: attrs[:customer_name], phone_number: attrs[:phone_number]) do |lead|
    attrs.each { |k, v| lead[k] = v }
  end
end

puts "Done. Sign in with employee_id=EMP-2201 password=password123"
