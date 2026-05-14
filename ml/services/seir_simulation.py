import numpy as np

class SEIRSimulation:
    def __init__(self):
        self.presets = {
            "Dengue": {"R0": 3.5, "gamma": 0.14, "sigma": 0.2},
            "Malaria": {"R0": 100, "gamma": 0.05, "sigma": 0.1},
            "Influenza": {"R0": 1.5, "gamma": 0.33, "sigma": 0.5},
            "COVID": {"R0": 2.5, "gamma": 0.1, "sigma": 0.2}
        }

    def get_presets(self):
        return self.presets

    def run(self, N: int, R0: float, gamma: float, days: int = 180, model: str = "SEIR", sigma: float = 0.2, interventions=None):
        if interventions is None:
            interventions = []

        beta = R0 * gamma

        # Initial conditions
        I = 1.0  # Initial infected
        E = 0.0 if model == "SIR" else 1.0  # Initial exposed
        R = 0.0
        S = N - I - E - R

        S_history = [S]
        E_history = [E]
        I_history = [I]
        R_history = [R]
        days_history = [0]

        for day in range(1, days + 1):
            current_beta = beta
            current_S = S

            # Apply interventions
            for inv in interventions:
                inv_day = inv.get("day", 0)
                inv_type = inv.get("type", "")
                
                if day >= inv_day:
                    if inv_type == "lockdown":
                        current_beta *= 0.4  # reduces beta by 60%
                    elif inv_type == "mask_mandate":
                        current_beta *= 0.7  # reduces beta by 30%
                    elif inv_type == "quarantine":
                        current_beta *= 0.55 # reduces beta by 45%
                
                if day == inv_day and inv_type == "vaccination":
                    # Instantaneous vaccination: moves 20% of S to R (assuming generic 20% coverage for demo)
                    vaccinated = current_S * 0.20
                    S -= vaccinated
                    R += vaccinated
                    current_S = S

            # Equations
            if model == "SIR":
                new_infections = (current_beta * current_S * I) / N
                new_recoveries = gamma * I

                S -= new_infections
                I += new_infections - new_recoveries
                R += new_recoveries
                E = 0.0
            else: # SEIR
                new_exposed = (current_beta * current_S * I) / N
                new_infections = sigma * E
                new_recoveries = gamma * I

                S -= new_exposed
                E += new_exposed - new_infections
                I += new_infections - new_recoveries
                R += new_recoveries

            # Ensure non-negative
            S = max(0, S)
            E = max(0, E)
            I = max(0, I)
            R = max(0, R)

            S_history.append(int(S))
            E_history.append(int(E))
            I_history.append(int(I))
            R_history.append(int(R))
            days_history.append(day)

        peak_infected = max(I_history)
        total_infected = R_history[-1] + I_history[-1] # Approximation of total infected by end of sim
        herd_immunity_threshold = (1 - (1/R0)) * 100 if R0 > 1 else 0.0

        return {
            "S": S_history,
            "E": E_history,
            "I": I_history,
            "R": R_history,
            "days": days_history,
            "peak_infected": int(peak_infected),
            "total_infected": int(total_infected),
            "herd_immunity_threshold": round(herd_immunity_threshold, 1)
        }
