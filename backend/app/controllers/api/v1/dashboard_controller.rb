module Api
  module V1
    class DashboardController < ApplicationController
      # GET /api/v1/dashboard
      #
      # NOTE: "genuine_lead_percent" and "lead_quality_score" are provisional
      # placeholder formulas until the business defines the real scoring rules:
      #   genuine_lead_percent = accepted / (accepted + rejected) * 100
      #   lead_quality_score   = weighted blend of accepted/rejected/follow-up
      #                          counts, scaled 0-100
      def index
        leads = current_employee.manager? ? Lead.all : current_employee.leads

        today_new_leads       = leads.today.count
        follow_ups            = leads.where(status: :follow_up_status).count
        pending_verification  = leads.where(status: :pending_verification).count
        accepted_leads        = leads.where(status: :accepted).count
        rejected_leads        = leads.where(status: :rejected).count
        total_lead_value      = leads.where(status: :accepted).sum(:amount)

        resolved = accepted_leads + rejected_leads
        genuine_lead_percent = resolved.zero? ? 0 : ((accepted_leads.to_f / resolved) * 100).round

        total = leads.count
        lead_quality_score =
          if total.zero?
            0
          else
            raw = (accepted_leads * 10) - (rejected_leads * 5) + (follow_ups * 2)
            [[(raw.to_f / total * 10).round, 0].max, 100].min
          end

        recent = leads.order(updated_at: :desc).limit(5).map do |lead|
          {
            id: lead.id,
            lead_code: "LD-#{10000 + lead.id}",
            customer_name: lead.customer_name,
            phone_number: lead.masked_phone_number,
            lead_type: lead.lead_type,
            amount: lead.amount,
            status: lead.status,
            updated_at: lead.updated_at
          }
        end

        render json: {
          today_new_leads: today_new_leads,
          follow_ups: follow_ups,
          pending_verification: pending_verification,
          accepted_leads: accepted_leads,
          rejected_leads: rejected_leads,
          total_lead_value: total_lead_value,
          genuine_lead_percent: genuine_lead_percent,
          lead_quality_score: lead_quality_score,
          recent_activity: recent
        }
      end
    end
  end
end
