module Api
  module V1
    class LeadsController < ApplicationController
      before_action :set_lead, only: [:show, :update, :destroy]

      # GET /api/v1/leads?lead_type=follow_up
      def index
        leads = visible_leads_scope.order(updated_at: :desc)
        leads = leads.where(lead_type: params[:lead_type]) if params[:lead_type].present?
        leads = leads.where(status: params[:status]) if params[:status].present?

        render json: leads.map { |lead| lead_json(lead, mask: !current_employee.cbm?) }
      end

      def show
        render json: lead_json(@lead, mask: false)
      end

      # POST /api/v1/leads
      def create
        lead = current_employee.leads.new(lead_params)

        if lead.save
          render json: lead_json(lead), status: :created
        else
          render json: { errors: lead.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # POST /api/v1/leads/bulk_create
      # Accepts { leads: [ { customer_name, phone_number, gold_quantity, amount,
      # lead_source, lead_type }, ... ] } — used by the spreadsheet-style bulk
      # entry grid. Agents may add many blank rows and only fill some of them,
      # so any row with no customer_name and no phone_number is silently
      # skipped rather than treated as an error. Rows that are filled in but
      # fail validation are reported individually; valid rows still save.
      def bulk_create
        rows = params.permit(leads: [:customer_name, :phone_number, :gold_quantity,
                                      :amount, :lead_source, :lead_type])[:leads] || []

        created = []
        row_errors = []

        rows.each_with_index do |row, index|
          next if row[:customer_name].blank? && row[:phone_number].blank?

          lead = current_employee.leads.new(
            customer_name: row[:customer_name],
            phone_number: row[:phone_number],
            gold_quantity: row[:gold_quantity].presence || 0,
            amount: row[:amount].presence || 0,
            lead_source: row[:lead_source].presence || "online_call",
            lead_type: row[:lead_type].presence || "new_lead"
          )

          if lead.save
            created << lead_json(lead)
          else
            row_errors << { row: index + 1, errors: lead.errors.full_messages }
          end
        end

        render json: {
          created: created,
          created_count: created.size,
          skipped_blank_count: rows.size - created.size - row_errors.size,
          errors: row_errors
        }, status: :ok
      end

      # PATCH /api/v1/leads/:id  (used to move status: follow_up -> accepted/rejected, etc.)
      def update
        if @lead.update(lead_params)
          render json: lead_json(@lead)
        else
          render json: { errors: @lead.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @lead.destroy
        head :no_content
      end

      private

      def set_lead
        @lead = visible_leads_scope.find_by(id: params[:id])
        render json: { error: "Lead not found" }, status: :not_found unless @lead
      end

      # Managers oversee the whole pipeline, so they can see/edit every
      # lead. CBM reviews closed-out leads (accepted or rejected) across
      # all agents. Everyone else is scoped to only the leads they created.
      def visible_leads_scope
        if current_employee.manager?
          Lead.all
        elsif current_employee.cbm?
          Lead.where(status: [:rejected, :accepted])
        else
          current_employee.leads
        end
      end

      def lead_params
        params.permit(:customer_name, :phone_number, :gold_quantity, :amount,
                       :lead_source, :lead_type, :status)
      end

      def lead_json(lead, mask: true)
        {
          id: lead.id,
          lead_code: "LD-#{10000 + lead.id}",
          customer_name: lead.customer_name,
          phone_number: mask ? lead.masked_phone_number : lead.phone_number,
          gold_quantity: lead.gold_quantity,
          amount: lead.amount,
          lead_source: lead.lead_source,
          lead_type: lead.lead_type,
          status: lead.status,
          updated_at: lead.updated_at
        }
      end
    end
  end
end
