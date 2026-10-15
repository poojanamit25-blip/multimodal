package com.kodexis.core.learning.service;

import com.kodexis.core.learning.model.Concept;
import com.kodexis.core.learning.model.CourseTopic;
import com.kodexis.core.learning.model.MultimodalContentUnit;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class KnowledgeIngestionService {

    private final Map<String, CourseTopic> topicCatalog = new ConcurrentHashMap<>();
    private final Map<String, Concept> conceptCatalog = new ConcurrentHashMap<>();
    private final Map<String, MultimodalContentUnit> contentUnits = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        // Starts clean with zero dummy data as requested: data is uploaded directly by the user.
        // User materials populate the knowledge base, quizzes, tutor grounding, and course graph dynamically.
    }

    public void clearAllData() {
        topicCatalog.clear();
        conceptCatalog.clear();
        contentUnits.clear();
    }

    public void loadSampleData() {
        clearAllData();
        seedCurriculumHierarchy();
        seedMultimodalContentUnits();
    }

    private void seedCurriculumHierarchy() {
        // TOPIC 1: Distributed Consensus & Replication
        CourseTopic t1 = new CourseTopic("topic-dist-consensus", "Distributed Consensus & Fault Tolerance",
                "Quorum systems, Paxos algorithm, Raft replicated state machines, and Byzantine fault tolerance.",
                "Distributed Systems", 12);
        t1.getSubtopics().addAll(Arrays.asList("Two-Phase Commit vs Consensus", "Raft Leader Election", "Log Replication & Safety", "Byzantine Agreement"));
        topicCatalog.put(t1.getId(), t1);

        // TOPIC 2: Distributed Consistency & Time
        CourseTopic t2 = new CourseTopic("topic-dist-consistency", "Logical Time, Clocks & Consistency Models",
                "Lamport logical timestamps, vector clocks, linearizability, sequential consistency, and eventual consistency.",
                "Distributed Systems", 10);
        t2.getPrerequisiteTopicIds().add("topic-dist-consensus");
        t2.getSubtopics().addAll(Arrays.asList("Lamport Timestamps", "Vector Clocks Causality", "Linearizability & CAP Theorem", "CRDTs & Eventual Consistency"));
        topicCatalog.put(t2.getId(), t2);

        // TOPIC 3: Advanced Graph Algorithms & Flow
        CourseTopic t3 = new CourseTopic("topic-algo-graphs", "Advanced Graph Traversal & Network Flow",
                "Shortest path variants, max-flow min-cut theorem, Ford-Fulkerson, and topological analysis.",
                "Data Structures & Algorithms", 14);
        t3.getSubtopics().addAll(Arrays.asList("Dijkstra & A* Heuristics", "Bellman-Ford & Negative Cycles", "Max-Flow Min-Cut Theorem", "Residual Graph Augmentation"));
        topicCatalog.put(t3.getId(), t3);

        // TOPIC 4: Dynamic Programming & Amortized Complexity
        CourseTopic t4 = new CourseTopic("topic-algo-dp", "Dynamic Programming & State Space Optimization",
                "Optimal substructure, overlapping subproblems, memoization vs tabulation, space-compression, and bitmask DP.",
                "Data Structures & Algorithms", 16);
        t4.getSubtopics().addAll(Arrays.asList("1D/2D Tabulation", "Knapsack & Subset Sum", "Matrix Chain Multiplication", "Bitmask & Tree DP"));
        topicCatalog.put(t4.getId(), t4);

        // TOPIC 5: Deep Learning Foundations & Optimization
        CourseTopic t5 = new CourseTopic("topic-dl-foundations", "Deep Learning Foundations & Backpropagation",
                "Computational graphs, automatic differentiation, backpropagation mechanics, activation functions, and gradient descent variants.",
                "Machine Learning", 14);
        t5.getSubtopics().addAll(Arrays.asList("Computational Graphs", "Chain Rule Backpropagation", "Vanishing & Exploding Gradients", "Adam & Momentum Optimizers"));
        topicCatalog.put(t5.getId(), t5);

        // TOPIC 6: Transformer Architectures & Attention
        CourseTopic t6 = new CourseTopic("topic-dl-transformers", "Transformers & Self-Attention Mechanisms",
                "Scaled dot-product attention, multi-head self-attention, positional encodings, encoder-decoder architectures, and causal masking.",
                "Machine Learning", 18);
        t6.getPrerequisiteTopicIds().add("topic-dl-foundations");
        t6.getSubtopics().addAll(Arrays.asList("Scaled Dot-Product Attention", "Multi-Head Projections", "Positional Encodings (RoPE/Sinusoidal)", "KV-Caching & Generation"));
        topicCatalog.put(t6.getId(), t6);

        // SEED KEY CONCEPTS
        seedConcept("concept-raft-election", "topic-dist-consensus", "Raft Leader Election & Term Monotonicity",
                "Mechanism where nodes transition from Follower to Candidate to Leader using randomized election timeouts and majority grant votes.", "INTERMEDIATE");
        seedConcept("concept-raft-log-safety", "topic-dist-consensus", "Raft Log Matching & Committed State Safety",
                "Invariant that if a log entry is committed at a given index and term, all higher-term leaders will contain that entry in their logs.", "ADVANCED");
        seedConcept("concept-vector-clocks", "topic-dist-consistency", "Vector Clocks & Causal Ordering",
                "An algorithm generating a vector of local logical clocks across N processes to definitively detect concurrent vs causally dependent events.", "INTERMEDIATE");
        seedConcept("concept-linearizability", "topic-dist-consistency", "Linearizability (Atomic Consistency)",
                "Strong consistency model guaranteeing that all operations appear to execute atomically at a specific linearization point between their invocation and response.", "ADVANCED");
        seedConcept("concept-max-flow", "topic-algo-graphs", "Max-Flow Min-Cut Theorem",
                "Fundamental theorem establishing that the maximum flow in a flow network equals the minimum capacity among all s-t cuts partitioning source from sink.", "ADVANCED");
        seedConcept("concept-bellman-ford", "topic-algo-graphs", "Bellman-Ford & Negative Weight Cycles",
                "Dynamic programming edge relaxation algorithm that computes single-source shortest paths in O(V*E) and detects negative cycle reachability.", "INTERMEDIATE");
        seedConcept("concept-backprop", "topic-dl-foundations", "Reverse-Mode Automatic Differentiation (Backprop)",
                "Application of the multivariable calculus chain rule across computational graph DAGs to calculate exact gradients of loss with respect to all weights in O(forward_pass) cost.", "INTERMEDIATE");
        seedConcept("concept-multihead-attention", "topic-dl-transformers", "Multi-Head Scaled Dot-Product Attention",
                "Mechanism computing softmax(Q*K^T / sqrt(d_k)) * V across h distinct linear projection subspaces simultaneously to capture disparate relational dependencies.", "ADVANCED");
        seedConcept("concept-kv-cache", "topic-dl-transformers", "KV Caching in Autoregressive Generation",
                "Inference optimization storing past key and value projection tensors in memory so token generation complexity scales linearly instead of quadratically per forward pass.", "ADVANCED");
    }

    private void seedConcept(String id, String topicId, String name, String def, String diff) {
        Concept c = new Concept(id, topicId, name, def, diff);
        conceptCatalog.put(c.getId(), c);
    }

    private void seedMultimodalContentUnits() {
        // UNIT 1: Video Lecture - Raft Leader Election
        MultimodalContentUnit u1 = new MultimodalContentUnit();
        u1.setId("unit-video-raft-01");
        u1.setTitle("MIT 6.824 Lecture 06: Raft Leader Election & Randomized Heartbeat Timeouts");
        u1.setSourceType(MultimodalContentUnit.SourceType.VIDEO);
        u1.setDocumentName("MIT 6.824 Distributed Systems");
        u1.setTopicId("topic-dist-consensus");
        u1.setTopicName("Distributed Consensus & Fault Tolerance");
        u1.setSubtopic("Raft Leader Election");
        u1.setConceptIds(Collections.singletonList("concept-raft-election"));
        u1.setConceptNames(Collections.singletonList("Raft Leader Election & Term Monotonicity"));
        u1.setVideoTimestampSeconds(264); // 04:24
        u1.setVideoUrl("https://assets.kodexis.internal/lectures/6824-lec6-raft.mp4");
        u1.setTextSnippet("When a follower node's heartbeat timeout timer expires without receiving an AppendEntries RPC from the current leader, it increments its currentTerm and transitions to the Candidate state. It votes for itself and broadcasts RequestVote RPCs in parallel to all peers. To prevent split votes where candidates simultaneously split the majority, Raft uses randomized election timeouts chosen uniformly from an interval such as 150ms to 300ms. Once a candidate secures votes from a strict majority (N/2 + 1), it assumes the Leader role and immediately broadcasts heartbeats.");
        u1.setHasVisualFigure(true);
        u1.setFigureTitle("Figure 6.1: Raft Node State Transitions & Timeout Trigger");
        u1.setFigureCaption("State transition diagram showing Follower, Candidate, and Leader states governed by randomized election timeouts and heartbeat reception.");
        u1.setDiagramType("STATE_MACHINE");
        u1.setFigureDescription("State machine showing: Follower times out -> Candidate (votes for self, sends RequestVote) -> Receives votes from majority -> Leader. Leader sends AppendEntries heartbeats. If discovered term > currentTerm, node drops back to Follower.");
        u1.setVisualDataUrl("data:image/svg+xml;utf8,<svg viewBox='0 0 500 240' xmlns='http://www.w3.org/2000/svg'><rect width='500' height='240' fill='%23090d16' rx='8'/><circle cx='80' cy='120' r='45' fill='%231e293b' stroke='%2338bdf8' stroke-width='2'/><text x='80' y='125' fill='%23e0f2fe' font-size='12' font-family='monospace' text-anchor='middle'>FOLLOWER</text><circle cx='250' cy='60' r='45' fill='%231e293b' stroke='%23f59e0b' stroke-width='2'/><text x='250' y='65' fill='%23fef3c7' font-size='12' font-family='monospace' text-anchor='middle'>CANDIDATE</text><circle cx='420' cy='120' r='45' fill='%231e293b' stroke='%2310b981' stroke-width='2'/><text x='420' y='125' fill='%23d1fae5' font-size='12' font-family='monospace' text-anchor='middle'>LEADER</text><path d='M 115 95 L 205 65' stroke='%23f59e0b' stroke-width='2' marker-end='url(%23arrow)'/><text x='155' y='68' fill='%2394a3b8' font-size='10' font-family='sans-serif'>Times out</text><path d='M 295 65 L 385 95' stroke='%2310b981' stroke-width='2'/><text x='345' y='68' fill='%2394a3b8' font-size='10' font-family='sans-serif'>Majority votes</text><path d='M 380 145 C 280 210, 190 210, 120 145' stroke='%23ef4444' stroke-width='2' stroke-dasharray='4'/><text x='250' y='195' fill='%23f87171' font-size='10' font-family='sans-serif' text-anchor='middle'>Discovers newer term (step down)</text></svg>");
        contentUnits.put(u1.getId(), u1);

        // UNIT 2: Slide Deck - Vector Clocks Causality
        MultimodalContentUnit u2 = new MultimodalContentUnit();
        u2.setId("unit-slide-vector-clocks-14");
        u2.setTitle("Distributed Systems Slide Deck: Vector Clocks & Concurrency Determination");
        u2.setSourceType(MultimodalContentUnit.SourceType.SLIDE);
        u2.setDocumentName("Distributed Computing Lecture Slides (CS451)");
        u2.setTopicId("topic-dist-consistency");
        u2.setTopicName("Logical Time, Clocks & Consistency Models");
        u2.setSubtopic("Vector Clocks Causality");
        u2.setConceptIds(Collections.singletonList("concept-vector-clocks"));
        u2.setConceptNames(Collections.singletonList("Vector Clocks & Causal Ordering"));
        u2.setSlideNumber(14);
        u2.setTextSnippet("Vector clock comparison rule: Event A with vector V_A happened before event B with vector V_B (written V_A < V_B) if and only if for every process index k, V_A[k] <= V_B[k], AND there exists at least one index j where V_A[j] < V_B[j]. If neither V_A < V_B nor V_B < V_A holds true, then events A and B are causally independent and concurrent (A || B). In conflict resolution (e.g. DynamoDB/Riak), concurrent vector clocks signal conflicting writes that require sibling resolution or application-level reconciliation.");
        u2.setHasVisualFigure(true);
        u2.setFigureTitle("Slide 14 Diagram: Vector Clock Timeline with 3 Processes (P1, P2, P3)");
        u2.setFigureCaption("Spacetime diagram demonstrating message transmission and vector merges across processes P1, P2, and P3.");
        u2.setDiagramType("FLOWCHART");
        u2.setFigureDescription("Visual trace: P1 executes local event [1,0,0], sends message to P2. P2 receives it, takes element-wise max([1,0,0], [0,1,0]) and increments own index to yield [1,2,0]. Concurrent branch on P3 produces [0,0,1], proving concurrency with [1,0,0].");
        u2.setVisualDataUrl("data:image/svg+xml;utf8,<svg viewBox='0 0 500 220' xmlns='http://www.w3.org/2000/svg'><rect width='500' height='220' fill='%230f172a' rx='8'/><line x1='50' y1='50' x2='450' y2='50' stroke='%23475569' stroke-width='2'/><text x='30' y='55' fill='%2338bdf8' font-family='monospace' font-size='12'>P1</text><line x1='50' y1='110' x2='450' y2='110' stroke='%23475569' stroke-width='2'/><text x='30' y='115' fill='%2338bdf8' font-family='monospace' font-size='12'>P2</text><line x1='50' y1='170' x2='450' y2='170' stroke='%23475569' stroke-width='2'/><text x='30' y='175' fill='%2338bdf8' font-family='monospace' font-size='12'>P3</text><circle cx='100' cy='50' r='5' fill='%2322d3ee'/><text x='100' y='38' fill='%23e2e8f0' font-size='10' font-family='monospace' text-anchor='middle'>[1,0,0]</text><line x1='100' y1='50' x2='220' y2='110' stroke='%2322d3ee' stroke-width='2' stroke-dasharray='3'/><circle cx='220' cy='110' r='5' fill='%23a855f7'/><text x='220' y='132' fill='%23e2e8f0' font-size='10' font-family='monospace' text-anchor='middle'>[1,2,0]</text><circle cx='150' cy='170' r='5' fill='%23eab308'/><text x='150' y='192' fill='%23fef08a' font-size='10' font-family='monospace' text-anchor='middle'>[0,0,1] || [1,0,0]</text></svg>");
        contentUnits.put(u2.getId(), u2);

        // UNIT 3: Textbook Chapter - Max Flow Min Cut Theorem
        MultimodalContentUnit u3 = new MultimodalContentUnit();
        u3.setId("unit-textbook-algo-page-652");
        u3.setTitle("Introduction to Algorithms (CLRS 4th Ed): Section 26.2 The Max-Flow Min-Cut Theorem");
        u3.setSourceType(MultimodalContentUnit.SourceType.TEXTBOOK);
        u3.setDocumentName("CLRS Introduction to Algorithms 4th Edition");
        u3.setTopicId("topic-algo-graphs");
        u3.setTopicName("Advanced Graph Traversal & Network Flow");
        u3.setSubtopic("Max-Flow Min-Cut Theorem");
        u3.setConceptIds(Collections.singletonList("concept-max-flow"));
        u3.setConceptNames(Collections.singletonList("Max-Flow Min-Cut Theorem"));
        u3.setPageNumber(652);
        u3.setTextSnippet("Theorem 26.6 (Max-Flow Min-Cut Theorem): Let f be a flow in a flow network G = (V, E) with source s and sink t. Then the following three conditions are strictly equivalent: (1) f is a maximum flow in G. (2) The residual network G_f contains no augmenting paths from s to t. (3) |f| = c(S, T) for some cut (S, T) of G. The capacity of a cut is defined as the sum of capacities of edges pointing from the source partition S to the sink partition T; edges pointing from T to S do not contribute to cut capacity.");
        u3.setHasVisualFigure(true);
        u3.setFigureTitle("Figure 26.4: Minimal s-t Cut Partition & Saturated Residual Edges");
        u3.setFigureCaption("Graph cut partitioning vertices into S = {s, v1, v2} and T = {v3, v4, t} with capacity exactly matching total maximum flow of 23.");
        u3.setDiagramType("ARCHITECTURE_DIAGRAM");
        u3.setFigureDescription("Bipartite partition cut dotted line separating S from T. Saturated edges crossing the cut have residual capacity 0, blocking any augmenting flow.");
        u3.setVisualDataUrl("data:image/svg+xml;utf8,<svg viewBox='0 0 500 200' xmlns='http://www.w3.org/2000/svg'><rect width='500' height='200' fill='%230f172a' rx='8'/><rect x='40' y='30' width='180' height='140' fill='%231e293b' stroke='%2338bdf8' stroke-width='1.5' rx='6'/><text x='130' y='50' fill='%2338bdf8' font-size='12' font-family='monospace' text-anchor='middle'>PARTITION S (Source)</text><rect x='280' y='30' width='180' height='140' fill='%231e293b' stroke='%23a855f7' stroke-width='1.5' rx='6'/><text x='370' y='50' fill='%23a855f7' font-size='12' font-family='monospace' text-anchor='middle'>PARTITION T (Sink)</text><line x1='250' y1='20' x2='250' y2='180' stroke='%23ef4444' stroke-width='2' stroke-dasharray='5 5'/><text x='250' y='195' fill='%23f87171' font-size='10' font-family='monospace' text-anchor='middle'>MIN-CUT CAPACITY = 23</text><line x1='180' y1='80' x2='300' y2='80' stroke='%2322c55e' stroke-width='3'/><text x='240' y='74' fill='%2386efac' font-size='10' font-family='monospace' text-anchor='middle'>c(e1)=12 (Full)</text><line x1='180' y1='120' x2='300' y2='120' stroke='%2322c55e' stroke-width='3'/><text x='240' y='114' fill='%2386efac' font-size='10' font-family='monospace' text-anchor='middle'>c(e2)=11 (Full)</text></svg>");
        contentUnits.put(u3.getId(), u3);

        // UNIT 4: Textbook Chapter - Bellman-Ford
        MultimodalContentUnit u4 = new MultimodalContentUnit();
        u4.setId("unit-textbook-algo-page-614");
        u4.setTitle("Introduction to Algorithms (CLRS 4th Ed): Section 24.1 The Bellman-Ford Algorithm");
        u4.setSourceType(MultimodalContentUnit.SourceType.TEXTBOOK);
        u4.setDocumentName("CLRS Introduction to Algorithms 4th Edition");
        u4.setTopicId("topic-algo-graphs");
        u4.setTopicName("Advanced Graph Traversal & Network Flow");
        u4.setSubtopic("Bellman-Ford & Negative Cycles");
        u4.setConceptIds(Collections.singletonList("concept-bellman-ford"));
        u4.setConceptNames(Collections.singletonList("Bellman-Ford & Negative Weight Cycles"));
        u4.setPageNumber(614);
        u4.setTextSnippet("The Bellman-Ford algorithm solves the single-source shortest-paths problem in the general case in which edge weights may be negative. Given a weighted, directed graph G = (V, E) with weight function w, Bellman-Ford returns a boolean indicating whether there is a negative-weight cycle reachable from source s. It executes |V| - 1 passes of relaxing every edge in E. If a subsequent |V|-th pass can still relax any edge (i.e. v.d > u.d + w(u, v)), then a negative-weight cycle is reachable.");
        u4.setHasVisualFigure(false);
        contentUnits.put(u4.getId(), u4);

        // UNIT 5: Video Lecture - Backpropagation & Computational Graphs
        MultimodalContentUnit u5 = new MultimodalContentUnit();
        u5.setId("unit-video-dl-backprop-08");
        u5.setTitle("Stanford CS231n Lecture 04: Backpropagation, Computational Graphs & Modular Gradients");
        u5.setSourceType(MultimodalContentUnit.SourceType.VIDEO);
        u5.setDocumentName("Stanford CS231n Convolutional Neural Networks");
        u5.setTopicId("topic-dl-foundations");
        u5.setTopicName("Deep Learning Foundations & Backpropagation");
        u5.setSubtopic("Chain Rule Backpropagation");
        u5.setConceptIds(Collections.singletonList("concept-backprop"));
        u5.setConceptNames(Collections.singletonList("Reverse-Mode Automatic Differentiation (Backprop)"));
        u5.setVideoTimestampSeconds(495); // 08:15
        u5.setVideoUrl("https://assets.kodexis.internal/lectures/cs231n-lec04-backprop.mp4");
        u5.setTextSnippet("Backpropagation is a recursive application of the chain rule along a DAG representing mathematical operations. At each node with inputs x, y and output z = f(x, y), during the forward pass the node computes z and caches local gradients dz/dx and dz/dy. In the backward pass, the node receives the upstream gradient dL/dz from its consumer. By the chain rule, it calculates the downstream gradients as dL/dx = (dL/dz) * (dz/dx) and dL/dy = (dL/dz) * (dz/dy). Branches in the forward pass become addition gates (+) in the backward pass.");
        u5.setHasVisualFigure(true);
        u5.setFigureTitle("Lecture Slide 22: Modular Computational Graph Gate with Local vs Upstream Gradients");
        u5.setFigureCaption("Modular gradient computation showing upstream gradient dL/dz multiplied by local gradient dz/dx to emit downstream gradient.");
        u5.setDiagramType("FLOWCHART");
        u5.setFigureDescription("A computational node with forward computation f(x,y) -> z. Upstream gradient dL/dz flows backwards from the right, multiplies with local partial derivative dz/dx, and flows to the left as dL/dx.");
        u5.setVisualDataUrl("data:image/svg+xml;utf8,<svg viewBox='0 0 500 200' xmlns='http://www.w3.org/2000/svg'><rect width='500' height='200' fill='%230b0f19' rx='8'/><rect x='180' y='60' width='140' height='80' fill='%231e293b' stroke='%2338bdf8' stroke-width='2' rx='6'/><text x='250' y='95' fill='%23e0f2fe' font-size='16' font-family='monospace' text-anchor='middle'>f(x, y)</text><text x='250' y='115' fill='%2394a3b8' font-size='10' font-family='sans-serif' text-anchor='middle'>Local: dz/dx, dz/dy</text><line x1='60' y1='80' x2='180' y2='80' stroke='%2322d3ee' stroke-width='2'/><text x='110' y='72' fill='%2322d3ee' font-size='11' font-family='monospace'>x (input)</text><line x1='320' y1='100' x2='440' y2='100' stroke='%23a855f7' stroke-width='2'/><text x='370' y='90' fill='%23a855f7' font-size='11' font-family='monospace'>z = f(x,y)</text><line x1='440' y1='120' x2='320' y2='120' stroke='%23ef4444' stroke-width='2' stroke-dasharray='4'/><text x='380' y='135' fill='%23f87171' font-size='10' font-family='monospace'>dL/dz (upstream)</text><line x1='180' y1='120' x2='60' y2='120' stroke='%23ef4444' stroke-width='2' stroke-dasharray='4'/><text x='110' y='138' fill='%23f87171' font-size='10' font-family='monospace'>dL/dx = (dL/dz)*(dz/dx)</text></svg>");
        contentUnits.put(u5.getId(), u5);

        // UNIT 6: Slide Deck - Transformer Scaled Dot-Product Attention & KV Caching
        MultimodalContentUnit u6 = new MultimodalContentUnit();
        u6.setId("unit-slide-transformer-attention-09");
        u6.setTitle("Stanford CS224N Slide Deck: Multi-Head Attention Mathematics & Key-Value Caching");
        u6.setSourceType(MultimodalContentUnit.SourceType.SLIDE);
        u6.setDocumentName("Stanford CS224N NLP with Deep Learning");
        u6.setTopicId("topic-dl-transformers");
        u6.setTopicName("Transformers & Self-Attention Mechanisms");
        u6.setSubtopic("Scaled Dot-Product Attention");
        u6.setConceptIds(Arrays.asList("concept-multihead-attention", "concept-kv-cache"));
        u6.setConceptNames(Arrays.asList("Multi-Head Scaled Dot-Product Attention", "KV Caching in Autoregressive Generation"));
        u6.setSlideNumber(9);
        u6.setTextSnippet("Scaled dot-product attention computes Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V. The scaling factor 1 / sqrt(d_k) prevents the dot products from growing excessively large in magnitude for high dimensional projections, where large values push the softmax function into regions of tiny gradients (gradient vanishing). During autoregressive token generation, recomputing K and V for all historical tokens at every single step causes O(N^2) redundant matrix operations; KV-caching stores the computed K and V matrices across generations, reducing generation step time to O(N).");
        u6.setHasVisualFigure(true);
        u6.setFigureTitle("Slide 9 Diagram: Scaled Dot-Product Attention Architecture Matrix");
        u6.setFigureCaption("Detailed vector matrix multiplication diagram illustrating scaling by 1/sqrt(d_k), optional causal masking, and weighted projection onto V.");
        u6.setDiagramType("FLOWCHART");
        u6.setFigureDescription("Diagram showing Q and K multiplied into QK^T matrix, divided by sqrt(d_k), optional causal mask applied, passed through row-wise softmax, and multiplied with V to yield output matrix.");
        u6.setVisualDataUrl("data:image/svg+xml;utf8,<svg viewBox='0 0 500 240' xmlns='http://www.w3.org/2000/svg'><rect width='500' height='240' fill='%230f172a' rx='8'/><rect x='80' y='30' width='80' height='35' fill='%231e293b' stroke='%2338bdf8' stroke-width='1.5' rx='4'/><text x='120' y='52' fill='%2338bdf8' font-size='12' font-family='monospace' text-anchor='middle'>MatMul (Q, K)</text><rect x='80' y='80' width='80' height='30' fill='%231e293b' stroke='%23cbd5e1' stroke-width='1' rx='4'/><text x='120' y='100' fill='%23e2e8f0' font-size='11' font-family='sans-serif' text-anchor='middle'>Scale 1/√d_k</text><rect x='80' y='125' width='80' height='30' fill='%231e293b' stroke='%23cbd5e1' stroke-width='1' rx='4'/><text x='120' y='145' fill='%23e2e8f0' font-size='11' font-family='sans-serif' text-anchor='middle'>Mask (Opt)</text><rect x='80' y='170' width='80' height='30' fill='%231e293b' stroke='%2310b981' stroke-width='1.5' rx='4'/><text x='120' y='190' fill='%2386efac' font-size='11' font-family='sans-serif' text-anchor='middle'>Softmax</text><rect x='240' y='170' width='100' height='30' fill='%231e293b' stroke='%23a855f7' stroke-width='1.5' rx='4'/><text x='290' y='190' fill='%23d8b4fe' font-size='11' font-family='monospace' text-anchor='middle'>MatMul (..., V)</text><line x1='120' y1='65' x2='120' y2='80' stroke='%2364748b' stroke-width='2'/><line x1='120' y1='110' x2='120' y2='125' stroke='%2364748b' stroke-width='2'/><line x1='120' y1='155' x2='120' y2='170' stroke='%2364748b' stroke-width='2'/><line x1='160' y1='185' x2='240' y2='185' stroke='%2364748b' stroke-width='2'/><text x='380' y='190' fill='%2338bdf8' font-size='12' font-family='monospace'>Output</text><line x1='340' y1='185' x2='370' y2='185' stroke='%2338bdf8' stroke-width='2'/></svg>");
        contentUnits.put(u6.getId(), u6);
    }

    public List<CourseTopic> getAllTopics() {
        return new ArrayList<>(topicCatalog.values());
    }

    public Optional<CourseTopic> getTopicById(String topicId) {
        return Optional.ofNullable(topicCatalog.get(topicId));
    }

    public List<Concept> getConceptsForTopic(String topicId) {
        return conceptCatalog.values().stream()
                .filter(c -> c.getTopicId().equals(topicId))
                .collect(Collectors.toList());
    }

    public List<Concept> getAllConcepts() {
        return new ArrayList<>(conceptCatalog.values());
    }

    public List<MultimodalContentUnit> getAllContentUnits() {
        return new ArrayList<>(contentUnits.values());
    }

    public Optional<MultimodalContentUnit> getContentUnitById(String id) {
        return Optional.ofNullable(contentUnits.get(id));
    }

    public List<MultimodalContentUnit> getContentUnitsForTopic(String topicId) {
        return contentUnits.values().stream()
                .filter(u -> topicId.equalsIgnoreCase(u.getTopicId()))
                .collect(Collectors.toList());
    }

    // Dynamic Ingestion endpoint (Requirement 1a: without manual preprocessing)
    public MultimodalContentUnit ingestCustomUnit(MultimodalContentUnit unit) {
        return ingestUserUploadedContent(unit);
    }

    public MultimodalContentUnit ingestUserUploadedContent(MultimodalContentUnit unit) {
        if (unit.getId() == null || unit.getId().trim().isEmpty()) {
            unit.setId("user-unit-" + UUID.randomUUID().toString().substring(0, 8));
        }

        // Normalize Topic
        String topicId = unit.getTopicId();
        if (topicId == null || topicId.trim().isEmpty()) {
            String base = unit.getTopicName() != null && !unit.getTopicName().trim().isEmpty()
                    ? unit.getTopicName() : "General Computer Science";
            topicId = "topic-" + base.toLowerCase().replaceAll("[^a-z0-9]+", "-");
            unit.setTopicId(topicId);
        }

        String topicName = unit.getTopicName() != null && !unit.getTopicName().trim().isEmpty()
                ? unit.getTopicName() : "Course Topic";

        CourseTopic topic = topicCatalog.get(topicId);
        if (topic == null) {
            topic = new CourseTopic(topicId, topicName,
                    "User uploaded course material for " + topicName,
                    unit.getDocumentName() != null ? unit.getDocumentName() : "User Uploaded Course", 10);
            if (unit.getSubtopic() != null && !unit.getSubtopic().trim().isEmpty()) {
                topic.getSubtopics().add(unit.getSubtopic());
            }
            // Link as prerequisite to existing topic in DAG if available
            if (!topicCatalog.isEmpty() && topic.getPrerequisiteTopicIds().isEmpty()) {
                topic.getPrerequisiteTopicIds().add(topicCatalog.keySet().iterator().next());
            }
            topicCatalog.put(topicId, topic);
        } else {
            if (unit.getSubtopic() != null && !topic.getSubtopics().contains(unit.getSubtopic())) {
                topic.getSubtopics().add(unit.getSubtopic());
            }
        }

        // Auto extract concepts if not provided
        if (unit.getConceptIds() == null || unit.getConceptIds().isEmpty()) {
            List<String> extractedConceptIds = new ArrayList<>();
            List<String> extractedConceptNames = new ArrayList<>();

            String text = unit.getTextSnippet() != null ? unit.getTextSnippet() : "";
            String[] sentences = text.split("\\.\\s+");
            String mainConceptName = (unit.getSubtopic() != null && !unit.getSubtopic().trim().isEmpty())
                    ? unit.getSubtopic() : unit.getTitle();

            String conceptId = "concept-" + mainConceptName.toLowerCase().replaceAll("[^a-z0-9]+", "-");
            String definition = sentences.length > 0 && !sentences[0].trim().isEmpty()
                    ? sentences[0] : ("Core concept in " + topicName);

            Concept concept = new Concept(conceptId, topicId, mainConceptName, definition, "INTERMEDIATE");
            conceptCatalog.put(concept.getId(), concept);

            extractedConceptIds.add(concept.getId());
            extractedConceptNames.add(concept.getName());

            unit.setConceptIds(extractedConceptIds);
            unit.setConceptNames(extractedConceptNames);
        } else {
            for (int i = 0; i < unit.getConceptIds().size(); i++) {
                String cId = unit.getConceptIds().get(i);
                String cName = i < unit.getConceptNames().size() ? unit.getConceptNames().get(i) : cId;
                if (!conceptCatalog.containsKey(cId)) {
                    Concept c = new Concept(cId, topicId, cName, "Key concept extracted from " + unit.getTitle(), "INTERMEDIATE");
                    conceptCatalog.put(cId, c);
                }
            }
        }

        contentUnits.put(unit.getId(), unit);
        return unit;
    }
}
