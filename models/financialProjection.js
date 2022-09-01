const mongoose = require("mongoose");


const ProjectionSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true
    },
    
    net_revenue_1: Number,
    net_revenue_2: Number,
    net_revenue_3: Number,
    
    CAC_1: Number,
    CAC_2: Number,
    CAC_3: Number,
    
    total_revenue_1: Number,
    total_revenue_2: Number,
    total_revenue_3: Number,
    
    growth_percent_1: Number,
    growth_percent_2: Number,
    growth_percent_3: Number,
    
    direct_cost_breakup_1: Number,
    direct_cost_breakup_2: Number,
    direct_cost_breakup_3: Number,
    
    gross_margin_1: Number,
    gross_margin_2: Number,
    gross_margin_3: Number,
    
    revenue_percent_1: Number,
    revenue_percent_2: Number,
    revenue_percent_3: Number,
    
    salaries_1: Number,
    salaries_2: Number,
    salaries_3: Number,
    
    founders_1: Number,
    founders_2: Number,
    founders_3: Number,
    
    tech_team_1: Number,
    tech_team_2: Number,
    tech_team_3: Number,
    
    sales_1: Number,
    sales_2: Number,
    sales_3: Number,
    
    senior_management_1: Number,
    senior_management_2: Number,
    senior_management_3: Number,
    
    OPS_1: Number,
    OPS_2: Number,
    OPS_3: Number,
    
    finance_1: Number,
    finance_2: Number,
    finance_3: Number,
    
    credit_1: Number,
    credit_2: Number,
    credit_3: Number,
    
    outsourced_1: Number,
    outsourced_2: Number,
    outsourced_3: Number,
    
    marketing_1: Number,
    marketing_2: Number,
    marketing_3: Number,
    
    office_tech_infra_1: Number,
    office_tech_infra_2: Number,
    office_tech_infra_3: Number,
    
    rentals_travel_other_expenses_1: Number,
    rentals_travel_other_expenses_2: Number,
    rentals_travel_other_expenses_3: Number,
    
    total_expenses_1: Number,
    total_expenses_2: Number,
    total_expenses_3: Number,
    
    EBIDTA_1: Number,
    EBIDTA_2: Number,
    EBIDTA_3: Number,
})

module.exports = new mongoose.model("Projection", ProjectionSchema);