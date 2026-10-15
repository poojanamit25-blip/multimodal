package com.kodexis.core.learning.service;

import com.kodexis.core.learning.model.DiagnosticReport;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

@Service
public class MisconceptionAnalysisService {

    private final Map<String, DiagnosticReport.MisconceptionFinding> catalog = new HashMap<>();

    @PostConstruct
    public void init() {
        catalog.put("MISCONCEPTION_PRIORITY_RANKING", new DiagnosticReport.MisconceptionFinding(
                "Distributed Consensus & Fault Tolerance",
                "Raft Leader Election",
                "Static Priority Bias",
                "You may be assuming nodes are ranked by static IP or hardware priority. In Raft, all followers are equal peers; randomized election timeouts break symmetry to prevent split votes.",
                "Review MIT 6.824 Lecture 6 @ 04:24 on randomized timeout bounds (150ms-300ms).",
                "[MIT 6.824 Distributed Systems @ 04:24]"
        ));

        catalog.put("MISCONCEPTION_QUORUM_TWO_THIRDS", new DiagnosticReport.MisconceptionFinding(
                "Distributed Consensus & Fault Tolerance",
                "Quorum Thresholds",
                "Byzantine vs Crash Quorum Confusion",
                "You used a 2/3 supermajority formula (needed only for Byzantine fault tolerance). In standard crash-stop Raft, a simple strict majority floor(N/2) + 1 is both necessary and sufficient.",
                "Review Quorum Invariants in Raft Summary paper Section 5.2.",
                "[MIT 6.824 Distributed Systems @ 04:24]"
        ));

        catalog.put("MISCONCEPTION_SUBTRACTING_BACKWARD_EDGES", new DiagnosticReport.MisconceptionFinding(
                "Advanced Graph Traversal & Network Flow",
                "Max-Flow Min-Cut Theorem",
                "Cut Capacity vs Net Flow Confusion",
                "You subtracted backward edge capacities pointing from T to S. Cut capacity c(S, T) strictly sums edges pointing from S to T. Backward edges only factor into net flow f(S, T), not capacity.",
                "Re-read CLRS Theorem 26.6 definition of c(S, T) on page 652.",
                "[CLRS Introduction to Algorithms 4th Edition - Page 652]"
        ));

        catalog.put("MISCONCEPTION_BELLMAN_V_PASSES", new DiagnosticReport.MisconceptionFinding(
                "Advanced Graph Traversal & Network Flow",
                "Bellman-Ford Algorithm",
                "Path Length Bound Misunderstanding",
                "Assuming shortest path calculation requires |V| relaxation loops. A simple path in a graph with |V| vertices can contain at most |V|-1 edges. The |V|-th iteration is exclusively an alert check for negative cycles.",
                "Review CLRS Chapter 24.1 invariant proof on page 614.",
                "[CLRS Introduction to Algorithms 4th Edition - Page 614]"
        ));

        catalog.put("MISCONCEPTION_SQUARE_ROOT_OMISSION", new DiagnosticReport.MisconceptionFinding(
                "Transformers & Self-Attention Mechanisms",
                "Scaled Dot-Product Attention",
                "Softmax Gradient Saturation Oversight",
                "Assuming attention dot product is unscaled (QK^T). For large projection dimensions d_k, dot products grow large in magnitude, pushing softmax into flat regions with near-zero gradients. Dividing by sqrt(d_k) stabilizes optimization.",
                "Review Stanford CS224N Slide 9 on attention scaling factors.",
                "[Stanford CS224N NLP with Deep Learning - Slide 9]"
        ));

        catalog.put("MISCONCEPTION_VECTOR_MAGNITUDE_COMPARE", new DiagnosticReport.MisconceptionFinding(
                "Logical Time, Clocks & Consistency Models",
                "Vector Clocks",
                "Scalar Sum vs Component-Wise Incomparability",
                "Attempting to compare vector timestamps by summing components rather than checking strict component-wise dominance across all indices. Mixed inequalities denote concurrent events.",
                "Inspect Distributed Computing Slide 14 Spacetime Diagram.",
                "[Distributed Computing Lecture Slides (CS451) - Slide 14]"
        ));
    }

    public DiagnosticReport.MisconceptionFinding findMisconception(String misconceptionKey) {
        if (misconceptionKey == null) return null;
        return catalog.get(misconceptionKey);
    }
}
