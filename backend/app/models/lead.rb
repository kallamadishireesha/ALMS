class Lead < ApplicationRecord
  belongs_to :employee

  # lead_source: how the support agent sourced the customer
  enum lead_source: {
    online_call: 0,       # agent reached out via online call within the 3-day window
    customer_referral: 1, # existing customer referred a new one
    walk_in: 2             # customer reached out to us directly
  }

  # lead_type: what kind of gold-loan opportunity this is
  #   new_lead   - a fresh customer with no existing deposit elsewhere
  #   follow_up  - still being worked, needs another touch
  #   take_over  - customer has gold deposited at a different branch/bank and is being
  #                moved over to us
  # (there used to be a `gl` "Genuine Lead" bucket at value 3 — removed;
  # see the migration that reassigns any leads still using it)
  enum lead_type: {
    new_lead: 0,
    follow_up: 1,
    take_over: 2
  }

  enum status: {
    new_status: 0,
    follow_up_status: 1,
    pending_verification: 2,
    accepted: 3,
    rejected: 4
  }, _prefix: :status

  validates :customer_name, presence: true
  validates :phone_number, presence: true, format: { with: /\A\d{10}\z/, message: "must be a 10-digit number" }
  validates :gold_quantity, numericality: { greater_than_or_equal_to: 0 }
  validates :amount, numericality: { greater_than_or_equal_to: 0 }

  # How many digits may differ from an existing phone number before a new
  # lead is still treated as "basically the same number" (e.g. an agent
  # padding their count by copy-pasting a real lead and tweaking a couple
  # of digits). 0 = exact match only. Raise/lower to tune sensitivity.
  NEAR_DUPLICATE_MAX_DIGIT_CHANGES = 2

  before_create :flag_suspicious_duplicate_phone_number

  scope :for_employee, ->(employee) { where(employee: employee) }
  scope :today, -> { where(created_at: Time.zone.now.beginning_of_day..Time.zone.now.end_of_day) }

  def masked_phone_number
    "XXXXXXX#{phone_number.to_s.last(3)}"
  end

  private

  # Catches three kinds of fake/gamed leads and rejects them automatically:
  #   1. Exact duplicate — this phone number is already on another lead.
  #   2. Near-duplicate — a real lead's number with only a couple of digits
  #      changed in place (the classic "copy an existing lead, tweak a few
  #      digits" trick). Since phone_number is always validated to exactly
  #      10 digits, comparing digit-by-digit (Hamming distance) is enough.
  #   3. Rearranged duplicate — same 10 digits as an existing number, just
  #      shuffled into a different order (e.g. ...7891 vs ...1987). This
  #      slips past the position-by-position check above since many
  #      positions differ, even though it's the same digits. Checking every
  #      permutation of a 10-digit number would mean comparing up to 10! =
  #      3.6M orderings per existing lead, so instead we sort each number's
  #      digits and compare — two numbers are rearrangements of each other
  #      if and only if their sorted digits are identical.
  def flag_suspicious_duplicate_phone_number
    return if phone_number.blank?

    existing_numbers = Lead.where.not(id: id).pluck(:phone_number)
    return if existing_numbers.empty?

    is_suspicious = existing_numbers.any? do |num|
      digit_distance(phone_number, num) <= NEAR_DUPLICATE_MAX_DIGIT_CHANGES ||
        same_digits_rearranged?(phone_number, num)
    end

    self.status = :rejected if is_suspicious
  end

  def digit_distance(a, b)
    return Float::INFINITY if a.length != b.length

    a.chars.zip(b.chars).count { |x, y| x != y }
  end

  def same_digits_rearranged?(a, b)
    return false if a.length != b.length

    a.chars.sort == b.chars.sort
  end
end
