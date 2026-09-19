class ReassignGlLeadType < ActiveRecord::Migration[7.1]
  # The `gl` ("Genuine Lead") lead_type (integer value 3) has been removed
  # from the Lead model's enum. Any existing row still storing 3 would
  # otherwise become unreadable (ArgumentError: '3' is not a valid
  # lead_type) the moment the app tries to load it. Reassign those rows to
  # `take_over` (2) — the closest remaining category — before the enum
  # mapping disappears.
  def up
    execute "UPDATE leads SET lead_type = 2 WHERE lead_type = 3"
  end

  def down
    # Not reversible — we don't know which rows were originally `gl`.
  end
end
