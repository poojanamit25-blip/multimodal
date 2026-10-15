package com.kodexis.core.learning.model;

public class BKTParameters {
    // Standard Bayesian Knowledge Tracing parameters
    private double priorProbability = 0.20; // P(L0) Initial belief learner knows concept
    private double transitionProbability = 0.15; // P(T) Probability of learning between opportunities
    private double slipProbability = 0.10; // P(S) Knows concept but makes a slip
    private double guessProbability = 0.20; // P(G) Does not know concept but guesses correctly

    public BKTParameters() {}

    public BKTParameters(double pL0, double pT, double pS, double pG) {
        this.priorProbability = pL0;
        this.transitionProbability = pT;
        this.slipProbability = pS;
        this.guessProbability = pG;
    }

    public double getPriorProbability() { return priorProbability; }
    public void setPriorProbability(double priorProbability) { this.priorProbability = priorProbability; }

    public double getTransitionProbability() { return transitionProbability; }
    public void setTransitionProbability(double transitionProbability) { this.transitionProbability = transitionProbability; }

    public double getSlipProbability() { return slipProbability; }
    public void setSlipProbability(double slipProbability) { this.slipProbability = slipProbability; }

    public double getGuessProbability() { return guessProbability; }
    public void setGuessProbability(double guessProbability) { this.guessProbability = guessProbability; }
}
