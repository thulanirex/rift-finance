import json, pandas as pd
from rift_score.scoring.risk_metric import evaluate_risk
from rift_score.features.identity import compute_identity_features
from rift_score.features.financial import compute_financial_features
from rift_score.features.payment_behavior import compute_payment_features
from rift_score.features.trade_flow import compute_trade_flow_features
from rift_score.features.esg import compute_esg_features
from rift_score.models.pd_model import PDModel

registry_flags={'lei_valid':True,'vat_valid':True,'eori_valid':True,'kyb_passed':True}
sanctions={'sanctions_hits':0,'pep':False,'adverse_media_count':0}
identity_feats=compute_identity_features(registry_flags, sanctions)

fin={'current_assets':200000,'current_liabilities':120000,'cash':50000,'ar':80000,'debt_service':10000,'ebitda':40000,'interest_expense':5000,'revenue_ttm':600000,'cogs_ttm':360000}
bank_stats={'returned_count':0,'tx_out_count':120,'cash_buffer_days':45}
financial_feats=compute_financial_features(fin, bank_stats)

invoices=pd.DataFrame([
    {'issue_date':'2025-06-01','due_date':'2025-07-01','paid_date':'2025-06-28','amount':50000},
    {'issue_date':'2025-07-10','due_date':'2025-08-10','paid_date':'2025-08-15','amount':60000},
    {'issue_date':'2025-08-20','due_date':'2025-09-20','paid_date':None,'amount':40000},
])
behaviour_feats=compute_payment_features(invoices)

trade_feats=compute_trade_flow_features(True,'Delivered',0.2, {'insured_ratio':0.8,'payout_prob':0.9,'deductible_ratio':0.1})
esg_feats=compute_esg_features({'certifications':['ISO14001'],'controversy_count':0,'governance_transparent':True})

pd_est=PDModel().predict_proba(behaviour_feats)
out=evaluate_risk(identity_feats, financial_feats, behaviour_feats, trade_feats, esg_feats, pd_est, ead=150000.0)
print(json.dumps(out, indent=2))
