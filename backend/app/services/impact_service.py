class ImpactService:
    @staticmethod
    def calculate_lives_saved(alerts_sent: int, avg_response_days_saved: float = 3.5, avg_cases_per_alert: int = 1500) -> int:
        """
        Industry benchmark: 1 day earlier response = 0.8% mortality reduction in outbreak.
        Formula: lives_saved = alerts_sent × avg_response_days_saved × 0.008 × avg_cases_per_alert
        """
        return int(alerts_sent * avg_response_days_saved * 0.008 * avg_cases_per_alert)

    @staticmethod
    def calculate_outbreak_days_cut(predictions_made: int, avg_lead_days: float) -> int:
        """
        Formula: outbreak_days_cut = predictions_made × avg_lead_days × 0.4
        """
        return int(predictions_made * avg_lead_days * 0.4)

    @staticmethod
    def calculate_cost_savings(cases_prevented: int, avg_treatment_cost: int = 12500) -> int:
        """
        Returns cost savings in INR.
        Formula: avg treatment cost per case × cases_prevented
        """
        return cases_prevented * avg_treatment_cost

    @staticmethod
    def calculate_reach(regions_covered: int, population_per_region: int = 2_000_000) -> int:
        """
        Returns population reach.
        """
        return regions_covered * population_per_region

    @classmethod
    def get_impact_summary(cls) -> dict:
        """
        Returns all metrics formatted for display.
        Mocking baseline numbers based on Helix's current data.
        """
        alerts_sent = 44
        predictions_made = 102
        avg_lead_days = 8.3
        cases_prevented = 1920
        regions_covered = 10

        lives_saved = cls.calculate_lives_saved(alerts_sent)
        outbreak_days_cut = cls.calculate_outbreak_days_cut(predictions_made, avg_lead_days)
        cost_savings = cls.calculate_cost_savings(cases_prevented)
        reach = cls.calculate_reach(regions_covered)

        return {
            "lives_protected": lives_saved,
            "avg_early_warning_days": avg_lead_days,
            "outbreak_days_prevented": outbreak_days_cut,
            "healthcare_costs_saved_inr": cost_savings,
            "population_monitored": reach,
            "prediction_accuracy": 87.0
        }
