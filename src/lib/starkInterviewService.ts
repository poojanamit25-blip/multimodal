export interface CSCategory {
  id: string;
  name: string;
  shortCode: string;
  tagline: string;
  description: string;
  icon: string;
  topics: string[];
  sampleQuestions: {
    junior: string;
    mid: string;
    senior: string;
  };
}

export const CS_CATEGORIES: CSCategory[] = [
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    shortCode: 'DSA',
    tagline: 'Complexity, Trees, Graphs, DP & Hash Tables',
    description: 'Algorithmic efficiency, time/space complexity, asymptotic analysis, dynamic programming, and data layout.',
    icon: 'Binary',
    topics: ['Arrays & Strings', 'Hash Maps & Sets', 'Trees & Binary Search Trees', 'Graph Traversals (BFS/DFS)', 'Dynamic Programming', 'Heaps & Priority Queues', 'Sorting & Binary Search'],
    sampleQuestions: {
      junior: 'Explain the internal mechanics of a Hash Map. How does it handle hash collisions, and what is the amortized versus worst-case time complexity?',
      mid: 'How would you detect a cycle in a directed graph versus an undirected graph? Walk me through Topological Sort and Kahn\'s algorithm.',
      senior: 'Walk me through how consistent hashing works in distributed caching. How do virtual nodes prevent hot-spotting during node additions or removals?'
    }
  },
  {
    id: 'os',
    name: 'Operating Systems',
    shortCode: 'OS',
    tagline: 'Kernels, Concurrency, Paging & Scheduling',
    description: 'Process management, multi-threading, synchronization primitives, virtual memory, paging, and deadlocks.',
    icon: 'Cpu',
    topics: ['Processes vs Threads', 'CPU Scheduling Algorithms', 'Virtual Memory & Paging', 'Deadlock Coffman Conditions', 'Semaphores & Mutexes', 'Inter-Process Communication (IPC)', 'System Calls & Context Switching'],
    sampleQuestions: {
      junior: 'What is the fundamental architectural difference between a Process and a Thread? How do context switches differ between them?',
      mid: 'Explain what happens at the hardware and kernel levels during a Page Fault, from TLB lookup to disk page swap.',
      senior: 'Explain the four Coffman conditions required for a Deadlock. How does modern kernel design prevent priority inversion using priority inheritance?'
    }
  },
  {
    id: 'cn',
    name: 'Computer Networks',
    shortCode: 'CN',
    tagline: 'TCP/IP, OSI Model, HTTP/3, Routing & Sockets',
    description: 'Network protocol stacks, TCP 3-way handshakes, socket programming, DNS resolution, and congestion control.',
    icon: 'Network',
    topics: ['OSI 7 Layers vs TCP/IP', 'TCP 3-Way Handshake & 4-Way Teardown', 'HTTP/1.1 vs HTTP/2 vs HTTP/3 (QUIC)', 'DNS Resolution Flow', 'TCP Congestion Control (Cubic/BBR)', 'UDP vs TCP Trade-offs', 'WebSockets & Sockets'],
    sampleQuestions: {
      junior: 'Walk me through the exact network flow when a user types "https://google.com" into a browser and hits Enter.',
      mid: 'Compare HTTP/2 multiplexing with HTTP/3 over QUIC. How does QUIC eliminate TCP head-of-line blocking over packet loss?',
      senior: 'Explain TCP sliding window protocol and how TCP congestion control algorithms like TCP BBR and CUBIC manage bandwidth and bufferbloat.'
    }
  },
  {
    id: 'dbms',
    name: 'Database Management Systems',
    shortCode: 'DBMS',
    tagline: 'ACID, B-Trees, SQL vs NoSQL, Indexing & Sharding',
    description: 'Relational query engines, storage engines, indexing strategies, transaction isolation levels, and sharding.',
    icon: 'Database',
    topics: ['ACID Properties & Transactions', 'B-Tree vs B+Tree vs LSM Trees', 'Indexing (Clustered vs Non-Clustered)', 'Transaction Isolation Levels & Anomalies', 'Normalization (1NF to BCNF)', 'Sharding & Replication Strategies', 'SQL vs NoSQL CAP Considerations'],
    sampleQuestions: {
      junior: 'What are the ACID properties in database management? Can you provide a concrete example of why Atomicity and Isolation are critical?',
      mid: 'Why do relational databases utilize B+ Trees instead of Binary Search Trees for disk-based indexing? Explain leaf node linked lists.',
      senior: 'Explain the difference between Read Committed, Repeatable Read, and Serializable isolation levels. What concurrency anomalies (Dirty Read, Phantom Read, Write Skew) does each solve?'
    }
  },
  {
    id: 'system_design',
    name: 'System Design & Architecture',
    shortCode: 'SYS',
    tagline: 'Scalability, Load Balancing, Caching & Microservices',
    description: 'High-availability distributed architectures, caching layers, message queues, and trade-offs under scale.',
    icon: 'LayoutGrid',
    topics: ['Horizontal vs Vertical Scaling', 'Load Balancing Algorithms (L4 vs L7)', 'Caching Strategies (Write-Through, Write-Back)', 'CAP Theorem & PACELC', 'Message Queues (Kafka vs RabbitMQ)', 'Database Sharding & Read Replicas', 'Rate Limiting (Token Bucket, Leaky Bucket)'],
    sampleQuestions: {
      junior: 'What is the CAP Theorem, and why is it impossible for a distributed system to simultaneously guarantee Consistency, Availability, and Partition Tolerance?',
      mid: 'How would you design a distributed URL Shortener handling 100 million writes per day and 1 billion reads per day?',
      senior: 'Design a distributed rate limiter that scales across multiple data centers handling 500,000 requests per second. How do you resolve race conditions and synchronization latency?'
    }
  },
  {
    id: 'ai',
    name: 'Artificial Intelligence',
    shortCode: 'AI',
    tagline: 'Search Algorithms, Heuristics, Knowledge Rep & Agents',
    description: 'State space search, A* heuristic algorithms, game playing (Minimax/Alpha-Beta), constraint satisfaction, and intelligent agents.',
    icon: 'BrainCircuit',
    topics: ['State Space Search & Heuristics', 'A* Search & Admissibility Criteria', 'Minimax Algorithm & Alpha-Beta Pruning', 'Constraint Satisfaction Problems (CSP)', 'Knowledge Representation & Ontologies', 'Reinforcement Learning Basics (MDP)', 'Autonomous Agent Loops (Sense-Plan-Act)'],
    sampleQuestions: {
      junior: 'Explain how the A* search algorithm works. What makes a heuristic function "admissible", and what happens if a heuristic overestimates the true cost?',
      mid: 'Describe the Minimax algorithm and how Alpha-Beta pruning optimizes the search tree without sacrificing decision optimality.',
      senior: 'How does Markov Decision Process (MDP) model decision making under uncertainty? Explain the Bellman optimality equation and the difference between Value Iteration and Policy Iteration.'
    }
  },
  {
    id: 'ml',
    name: 'Machine Learning & Deep Learning',
    shortCode: 'ML',
    tagline: 'Supervised/Unsupervised, Neural Nets & Transformers',
    description: 'Statistical learning, gradient descent, bias-variance tradeoff, regularization, and deep neural network architectures.',
    icon: 'Sparkles',
    topics: ['Supervised vs Unsupervised Learning', 'Bias-Variance Tradeoff & Overfitting', 'Gradient Descent (SGD, Adam)', 'Regularization (L1 Lasso, L2 Ridge, Dropout)', 'Convolutional & Recurrent Networks (CNN/RNN)', 'Transformer Architecture & Self-Attention', 'Evaluation Metrics (Precision, Recall, ROC-AUC, F1)'],
    sampleQuestions: {
      junior: 'Explain the bias-variance tradeoff in machine learning. How do techniques like L1 and L2 regularization prevent overfitting?',
      mid: 'How does the Scaled Dot-Product Attention mechanism operate in Transformer architectures? What is the mathematical formulation of Q, K, and V matrices?',
      senior: 'Explain vanishing and exploding gradients in deep neural networks. How do residual skip connections (ResNet) and Layer Normalization mathematically prevent gradient degradation?'
    }
  },
  {
    id: 'oop',
    name: 'OOP & Software Engineering',
    shortCode: 'OOP',
    tagline: 'SOLID Principles, Design Patterns & Clean Architecture',
    description: 'Object-oriented paradigms, inheritance vs composition, design patterns (Creational, Structural, Behavioral), and clean code.',
    icon: 'Layers',
    topics: ['Encapsulation, Abstraction, Inheritance, Polymorphism', 'SOLID Principles with Code Examples', 'Design Patterns (Factory, Singleton, Observer, Strategy)', 'Composition over Inheritance', 'Clean Code & Refactoring', 'Dependency Injection & Inversion of Control', 'Design for Testability'],
    sampleQuestions: {
      junior: 'Explain the five SOLID principles with a clear real-world code example for the Open-Closed Principle and Dependency Inversion.',
      mid: 'What is the Strategy Design Pattern? How does it differ from the State Pattern, and how does it promote loose coupling over multiple conditional switch blocks?',
      senior: 'Contrast Dependency Injection (DI) with Service Locator pattern. How does Inversion of Control (IoC) architecture enhance modularity and memory safety in large enterprise codebases?'
    }
  },
  {
    id: 'cloud_web',
    name: 'Web Technologies & Cloud DevOps',
    shortCode: 'CLOUD',
    tagline: 'REST, WebSockets, Containers, K8s & Serverless',
    description: 'Modern full-stack web standards, stateless architecture, containerization with Docker, orchestration, and CI/CD pipelines.',
    icon: 'Cloud',
    topics: ['RESTful Architecture & Idempotency', 'WebSockets vs Server-Sent Events (SSE)', 'Docker Containers vs Virtual Machines', 'Kubernetes Architecture (Pods, Deployments, Services)', 'Serverless Architecture & Cold Starts', 'CI/CD Pipelines & Zero-Downtime Deployments', 'Microservices vs Monoliths'],
    sampleQuestions: {
      junior: 'What makes an HTTP method "idempotent"? Contrast PUT vs POST vs PATCH in REST API design.',
      mid: 'How do Docker containers isolate processes using Linux namespaces and cgroups? How does this differ from hypervisor-based Virtual Machines?',
      senior: 'Explain Kubernetes pod scheduling, self-healing, and service routing via kube-proxy. How do rolling updates achieve zero-downtime deployments under high traffic?'
    }
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity & Cryptography',
    shortCode: 'SEC',
    tagline: 'Encryption, OWASP Top 10, Auth & Zero-Trust',
    description: 'Asymmetric and symmetric encryption, hashing algorithms, authentication protocols (OAuth/JWT), and web application security.',
    icon: 'Shield',
    topics: ['Symmetric vs Asymmetric Encryption (AES vs RSA)', 'Cryptographic Hashing & Salt (SHA-256, bcrypt)', 'OWASP Top 10 (SQL Injection, XSS, CSRF)', 'JWT Architecture & Token Security', 'OAuth 2.0 & OIDC Flow', 'HTTPS / TLS Handshake & Public Key Infrastructure', 'Zero-Trust Architecture Principles'],
    sampleQuestions: {
      junior: 'Explain Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF). How do modern frameworks and SameSite cookie attributes mitigate them?',
      mid: 'Walk me through the TLS 1.3 cryptographic handshake. How does Diffie-Hellman ephemeral key exchange guarantee Forward Secrecy?',
      senior: 'How does an authentication system securely store candidate passwords? Explain the mathematical differences between fast hash algorithms and memory-hard Key Derivation Functions like Argon2 or bcrypt.'
    }
  }
];

export interface StarkQuestion {
  id: string;
  phase: 'intro' | 'intro_followup' | 'category_deep' | 'category_probe' | 'wrapup';
  categoryId?: string;
  categoryName?: string;
  questionText: string;
  hints: string[];
  expectedKeywords: string[];
  depthLevel: 'icebreaker' | 'foundational' | 'deep' | 'architectural';
}

export interface StarkInterviewSession {
  sessionId: string;
  candidateName: string;
  targetRole: string;
  experienceLevel: 'junior' | 'mid' | 'senior' | 'staff';
  selectedCategories: string[];
  durationMinutes: number;
  totalTimeSeconds: number;
  currentQuestionIndex: number;
  questions: StarkQuestion[];
  transcripts: {
    questionId: string;
    questionText: string;
    category?: string;
    phase: string;
    userAnswerText: string;
    score: number;
    feedback: string;
    durationSeconds: number;
    timestamp: string;
  }[];
  startedAt: string;
  completedAt?: string;
  finalEvaluation?: StarkEvaluation;
}

export interface StarkEvaluation {
  overallScore: number;
  recommendation: 'STRONG_HIRE' | 'HIRE' | 'LEAN_HIRE' | 'NEEDS_PRACTICE';
  technicalProficiencyScore: number;
  communicationScore: number;
  conceptualDepthScore: number;
  problemSolvingScore: number;
  categoryScores: Record<string, number>;
  keyStrengths: string[];
  areasForImprovement: string[];
  detailedDebrief: string;
}

// Deep Adaptive Question Pool for continuous generation
const ADAPTIVE_CATEGORY_POOLS: Record<string, Array<{ text: string; hints: string[]; keywords: string[] }>> = {
  dsa: [
    {
      text: 'Consider designing an LRU Cache with O(1) get and put operations. Explain why a Doubly Linked List paired with a Hash Map is ideal, and how evictions are handled under concurrent access.',
      hints: ['Doubly linked list pointer updates', 'Hash map key to node lookup', 'Locking vs ConcurrentHashMap'],
      keywords: ['doubly linked list', 'hash map', 'o(1)', 'eviction', 'tail', 'head', 'node', 'concurrency']
    },
    {
      text: 'Suppose you have a stream of billions of integers and need to compute the running median in real time. Walk me through how a dual-heap approach (Max-Heap and Min-Heap) balances efficiently.',
      hints: ['Max-heap for lower half', 'Min-heap for upper half', 'Rebalancing invariant'],
      keywords: ['heap', 'median', 'max-heap', 'min-heap', 'balance', 'log n', 'stream', 'root']
    },
    {
      text: 'Contrast Depth-First Search with Breadth-First Search on an implicit state space graph. When would Iterative Deepening DFS (IDDFS) be strictly superior in memory-constrained environments?',
      hints: ['Stack space vs queue space', 'Completeness and optimality', 'Branching factor'],
      keywords: ['dfs', 'bfs', 'iddfs', 'memory', 'stack', 'queue', 'optimality', 'depth']
    }
  ],
  os: [
    {
      text: 'Explain the exact lifecycle of an I/O operation from user space to disk, covering device drivers, interrupt handlers, and Direct Memory Access (DMA).',
      hints: ['System call trap', 'DMA controller memory transfer', 'Hardware interrupt'],
      keywords: ['dma', 'interrupt', 'driver', 'disk', 'kernel', 'user space', 'buffer', 'io']
    },
    {
      text: 'Compare thread scheduling in the Linux Completely Fair Scheduler (CFS) with traditional round-robin. How does virtual runtime (vruntime) prevent CPU starvation?',
      hints: ['Red-black tree ordering', 'Virtual runtime metric', 'Thread weights and nice values'],
      keywords: ['cfs', 'vruntime', 'red-black tree', 'starvation', 'scheduler', 'quantum', 'priority']
    },
    {
      text: 'What happens during a system call (like read or fork) at the CPU register and stack levels when transitioning from User Mode Ring 3 to Kernel Mode Ring 0?',
      hints: ['Interrupt descriptor table (IDT)', 'Stack pointer register switch', 'Mode transition trap'],
      keywords: ['ring 3', 'ring 0', 'trap', 'register', 'kernel stack', 'context', 'privilege']
    }
  ],
  cn: [
    {
      text: 'Explain how TLS 1.3 optimizes the connection handshake to a single round trip (1-RTT) and zero round trip (0-RTT). What security vulnerabilities, such as replay attacks, emerge with 0-RTT?',
      hints: ['Diffie-Hellman key share in ClientHello', 'Pre-shared key (PSK) session resumption', 'Replay mitigation'],
      keywords: ['tls 1.3', '1-rtt', '0-rtt', 'diffie-hellman', 'handshake', 'replay', 'psk', 'crypto']
    },
    {
      text: 'Walk through how BGP (Border Gateway Protocol) and autonomous systems route traffic across the global Internet. How does BGP prevent routing loops across AS paths?',
      hints: ['Path vector protocol', 'AS-Path attribute check', 'Peering vs transit'],
      keywords: ['bgp', 'autonomous system', 'as-path', 'routing', 'loop', 'peering', 'gateway']
    },
    {
      text: 'Compare Layer 4 TCP load balancing (e.g. AWS Network Load Balancer or IPVS) with Layer 7 HTTP reverse proxy load balancing (e.g. Envoy or Nginx). When would you choose each?',
      hints: ['Packet-level proxy vs HTTP parsing', 'SSL termination capabilities', 'Throughput vs routing intelligence'],
      keywords: ['layer 4', 'layer 7', 'load balancer', 'tcp', 'http', 'ssl termination', 'throughput']
    }
  ],
  dbms: [
    {
      text: 'Explain how Write-Ahead Logging (WAL) and the ARIES recovery algorithm ensure Durability and Atomicity in relational database crash recovery.',
      hints: ['Log sequence numbers (LSN)', 'Analysis, Redo, and Undo passes', 'Dirty page table'],
      keywords: ['wal', 'aries', 'crash recovery', 'redo', 'undo', 'atomicity', 'durability', 'lsn']
    },
    {
      text: 'Compare Multi-Version Concurrency Control (MVCC) in PostgreSQL with 2-Phase Locking (2PL) in MySQL InnoDB. How does MVCC prevent read locks from blocking writes?',
      hints: ['Tuple snapshot isolation', 'XMIN and XMAX transaction IDs', 'Vacuuming dead tuples'],
      keywords: ['mvcc', '2pl', 'locking', 'postgresql', 'innodb', 'snapshot', 'concurrency', 'isolation']
    },
    {
      text: 'How does a database query optimizer decide between a Hash Join, a Merge Join, and a Nested Loop Join based on table cardinality and indexes?',
      hints: ['Cost-based optimizer (CBO)', 'Sorted input requirement for Merge Join', 'Hash table build phase in memory'],
      keywords: ['hash join', 'merge join', 'nested loop', 'cbo', 'index', 'cardinality', 'optimizer']
    }
  ],
  system_design: [
    {
      text: 'Design a globally distributed idempotency system for payments that guarantees exactly-once processing even if network retries and duplicate webhooks occur.',
      hints: ['Idempotency key uniqueness constraint', 'Distributed lock (Redis Redlock)', 'State machine transitions'],
      keywords: ['idempotency', 'distributed lock', 'redis', 'payments', 'webhook', 'retry', 'deduplication']
    },
    {
      text: 'How would you design a distributed telemetry time-series ingest engine (like Prometheus or Datadog) ingesting 5 million data points per second with rolling window aggregations?',
      hints: ['Kafka partition keying', 'LSM time-bucketed storage', 'Downsampling and rollup workers'],
      keywords: ['time-series', 'kafka', 'partition', 'ingest', 'downsampling', 'aggregation', 'lsm']
    },
    {
      text: 'Explain the mechanics of distributed consensus algorithms like Raft. How do leader election, log replication, and split-brain resolution work during network partitions?',
      hints: ['Heartbeat timeouts', 'Majority quorum voting', 'Term number monotonicity'],
      keywords: ['raft', 'consensus', 'leader election', 'quorum', 'split-brain', 'log replication', 'partition']
    }
  ],
  ai: [
    {
      text: 'Explain how Monte Carlo Tree Search (MCTS) works in games with massive state spaces like Go or Chess. Walk me through the four phases: selection, expansion, simulation, and backpropagation.',
      hints: ['Upper Confidence Bound for Trees (UCT)', 'Random rollout phase', 'Backpropagating win rates'],
      keywords: ['mcts', 'uct', 'selection', 'expansion', 'simulation', 'backpropagation', 'tree', 'heuristics']
    },
    {
      text: 'How do knowledge graphs and semantic ontologies complement large language models to reduce hallucinations? Explain entity resolution and graph-augmented generation.',
      hints: ['Triplets (subject, predicate, object)', 'Cypher / SPARQL graph retrieval', 'Factual ground-truth injection'],
      keywords: ['knowledge graph', 'hallucination', 'entity', 'ontology', 'grounding', 'rag', 'semantic']
    }
  ],
  ml: [
    {
      text: 'Walk through how backpropagation calculates gradients using the chain rule across matrix operations. Why do we accumulate gradients in mini-batch stochastic gradient descent?',
      hints: ['Jacobian matrix multiplication', 'Computational graph reverse pass', 'Variance reduction in mini-batches'],
      keywords: ['backpropagation', 'chain rule', 'gradients', 'sgd', 'mini-batch', 'matrix', 'loss']
    },
    {
      text: 'Compare Transformer self-attention complexity of O(N squared) with Linear Attention and FlashAttention. How does FlashAttention optimize GPU SRAM memory bandwidth without materializing full attention matrices?',
      hints: ['Tiling and recomputation', 'SRAM vs HBM memory transfer', 'Softmax online scaling'],
      keywords: ['flashattention', 'sram', 'hbm', 'attention', 'transformer', 'tiling', 'complexity']
    }
  ],
  oop: [
    {
      text: 'Explain how the Liskov Substitution Principle (LSP) prevents subtle polymorphism bugs. Give a classic violation example and explain how refactoring to interfaces or composition fixes it.',
      hints: ['Rectangle vs Square subclassing', 'Preconditions and postconditions', 'Contract integrity'],
      keywords: ['liskov', 'lsp', 'polymorphism', 'inheritance', 'interface', 'composition', 'precondition']
    },
    {
      text: 'How do you implement the Observer Pattern with asynchronous event dispatchers while preventing memory leaks from dangling listener references?',
      hints: ['Weak references (WeakMap / WeakRef)', 'Explicit unsubscribe lifecycle hooks', 'Thread-safe event buses'],
      keywords: ['observer', 'listener', 'memory leak', 'weakref', 'event bus', 'unsubscribe', 'async']
    }
  ],
  cloud_web: [
    {
      text: 'Walk me through how a Kubernetes Service Mesh (like Istio and Envoy sidecars) implements mutual TLS (mTLS), traffic canary routing, and circuit breaking at the network layer.',
      hints: ['Envoy proxy interception with iptables', 'Control plane certificate distribution', 'Circuit breaker consecutive gateway errors'],
      keywords: ['istio', 'envoy', 'sidecar', 'mtls', 'canary', 'circuit breaker', 'mesh', 'kubernetes']
    },
    {
      text: 'How does the WebSocket protocol upgrade handshake (RFC 6455) transition from HTTP/1.1? How do frame masking, opcodes, and ping-pong keepalive mechanisms function?',
      hints: ['101 Switching Protocols header', 'Sec-WebSocket-Key and SHA-1 accept', 'Client-to-server payload XOR masking'],
      keywords: ['websocket', 'handshake', '101 switching protocols', 'masking', 'opcode', 'ping', 'pong']
    }
  ],
  cybersecurity: [
    {
      text: 'Walk through how asymmetric cryptography (RSA / ECC) enables digital signatures. How does public key validation prevent Man-in-the-Middle (MITM) attacks during secure transactions?',
      hints: ['Private key signing hash', 'Public key decrypting and verifying digest', 'Certificate Authority chain of trust'],
      keywords: ['asymmetric', 'rsa', 'ecc', 'digital signature', 'hash', 'certificate authority', 'mitm', 'pki']
    },
    {
      text: 'Explain the difference between authentication and authorization in OAuth 2.0 with OpenID Connect. What is PKCE (Proof Key for Code Exchange) and why is it critical for Single Page Applications?',
      hints: ['ID token vs Access token', 'Code verifier and code challenge', 'Authorization code interception prevention'],
      keywords: ['oauth 2.0', 'oidc', 'pkce', 'authentication', 'authorization', 'jwt', 'code verifier']
    }
  ]
};

export interface CandidateContextAnalysis {
  recognizedTopicId?: string;
  acknowledgedTopicName?: string;
  conversationalPrefix: string;
}

export function analyzeCandidateContext(answerText: string): CandidateContextAnalysis {
  const lower = (answerText || '').toLowerCase().trim();

  // 1. Check for OOP / Oops
  if (
    lower.includes('oops') ||
    lower.includes('oop') ||
    lower.includes('object oriented') ||
    lower.includes('polymorphism') ||
    lower.includes('inheritance') ||
    lower.includes('encapsulation')
  ) {
    return {
      recognizedTopicId: 'oop',
      acknowledgedTopicName: 'Object-Oriented Programming',
      conversationalPrefix: "That's good! Since you know Object-Oriented Programming, let's explore how you apply its core principles in production software design."
    };
  }

  // 2. Check for DSA
  if (
    lower.includes('dsa') ||
    lower.includes('data structures') ||
    lower.includes('algorithms') ||
    lower.includes('binary search') ||
    lower.includes('dynamic programming') ||
    lower.includes('trees') ||
    lower.includes('graphs')
  ) {
    return {
      recognizedTopicId: 'dsa',
      acknowledgedTopicName: 'Data Structures & Algorithms',
      conversationalPrefix: "That's good! Having a firm grasp of Data Structures and Algorithms is essential for scalable engineering."
    };
  }

  // 3. Check for OS
  if (
    lower.includes('os') ||
    lower.includes('operating system') ||
    lower.includes('concurrency') ||
    lower.includes('threads') ||
    lower.includes('multithreading') ||
    lower.includes('deadlock') ||
    lower.includes('virtual memory')
  ) {
    return {
      recognizedTopicId: 'os',
      acknowledgedTopicName: 'Operating Systems',
      conversationalPrefix: "That's good! Deep knowledge of Operating Systems and concurrency models is vital for systems architecture."
    };
  }

  // 4. Check for Computer Networks
  if (
    lower.includes('cn') ||
    lower.includes('computer networks') ||
    lower.includes('networking') ||
    lower.includes('tcp') ||
    lower.includes('http') ||
    lower.includes('dns') ||
    lower.includes('socket')
  ) {
    return {
      recognizedTopicId: 'cn',
      acknowledgedTopicName: 'Computer Networks',
      conversationalPrefix: "That's good! Network fundamentals and protocol dynamics are crucial for modern distributed services."
    };
  }

  // 5. Check for DBMS / SQL
  if (
    lower.includes('dbms') ||
    lower.includes('database') ||
    lower.includes('sql') ||
    lower.includes('postgres') ||
    lower.includes('mysql') ||
    lower.includes('indexing') ||
    lower.includes('acid')
  ) {
    return {
      recognizedTopicId: 'dbms',
      acknowledgedTopicName: 'Database Management Systems',
      conversationalPrefix: "That's good! Knowing database architecture and query optimization is key for reliable backends."
    };
  }

  // 6. Check for System Design
  if (
    lower.includes('system design') ||
    lower.includes('distributed system') ||
    lower.includes('microservices') ||
    lower.includes('scalability') ||
    lower.includes('load balancer') ||
    lower.includes('caching') ||
    lower.includes('kafka')
  ) {
    return {
      recognizedTopicId: 'system_design',
      acknowledgedTopicName: 'System Design & Architecture',
      conversationalPrefix: "That's good! Distributed systems and scalability trade-offs are central to high-impact engineering."
    };
  }

  // 7. Check for AI & Machine Learning
  if (
    lower.includes('ai') ||
    lower.includes('artificial intelligence') ||
    lower.includes('machine learning') ||
    lower.includes('ml') ||
    lower.includes('deep learning') ||
    lower.includes('neural') ||
    lower.includes('transformer')
  ) {
    return {
      recognizedTopicId: 'ai',
      acknowledgedTopicName: 'Artificial Intelligence & Machine Learning',
      conversationalPrefix: "That's good! Navigating AI architectures and probabilistic reasoning is very valuable in modern software."
    };
  }

  // 8. Check for Cloud / DevOps
  if (
    lower.includes('cloud') ||
    lower.includes('aws') ||
    lower.includes('docker') ||
    lower.includes('kubernetes') ||
    lower.includes('devops') ||
    lower.includes('ci/cd')
  ) {
    return {
      recognizedTopicId: 'cloud_web',
      acknowledgedTopicName: 'Cloud & Infrastructure',
      conversationalPrefix: "That's good! Practical cloud containerization and infrastructure resilience are key to keeping modern services online."
    };
  }

  // 9. Check for Cybersecurity
  if (
    lower.includes('security') ||
    lower.includes('cyber') ||
    lower.includes('cryptography') ||
    lower.includes('oauth') ||
    lower.includes('authentication')
  ) {
    return {
      recognizedTopicId: 'cybersecurity',
      acknowledgedTopicName: 'Cybersecurity',
      conversationalPrefix: "That's good! Defensive architectural patterns and secure token authorization protect systems against serious threats."
    };
  }

  // 10. Check if candidate mentioned languages or frameworks
  const techTerms = ['python', 'java', 'c++', 'javascript', 'typescript', 'react', 'node', 'spring', 'go', 'golang', 'rust'];
  for (const t of techTerms) {
    if (lower.includes(t)) {
      return {
        acknowledgedTopicName: t.toUpperCase(),
        conversationalPrefix: `That's good! Having hands-on fluency with ${t.charAt(0).toUpperCase() + t.slice(1)} provides valuable engineering leverage.`
      };
    }
  }

  if (lower.length > 25) {
    return {
      conversationalPrefix: "That's good! Thank you for that clear explanation."
    };
  }

  return {
    conversationalPrefix: "Understood."
  };
}

/**
 * Initialize Elsa Interview Plan
 */
export function generateStarkInterviewPlan(
  candidateName: string,
  selectedCategoryIds: string[],
  experienceLevel: 'junior' | 'mid' | 'senior' | 'staff',
  _durationMinutes: number = 15
): StarkQuestion[] {
  const plan: StarkQuestion[] = [];

  // Phase 1: Icebreaker / Self-Introduction (Always First!)
  plan.push({
    id: 'elsa-intro-1',
    phase: 'intro',
    questionText: `Greetings, ${candidateName}! I am Elsa, your lead technical interviewer today. Before we dive into deep engineering challenges, I'd like to get to know you. Please introduce yourself, share the technical topics you are most confident in, and highlight a complex engineering project or technical hurdle you've tackled recently.`,
    hints: ['Mention your core tech stack & strengths', 'Describe your project architecture', 'Highlight key engineering decisions'],
    expectedKeywords: ['experience', 'project', 'developed', 'built', 'architecture', 'stack', 'technologies', 'challenges', 'service'],
    depthLevel: 'icebreaker'
  });

  // Phase 2: Follow-up Question based on technical background
  plan.push({
    id: 'elsa-intro-followup',
    phase: 'intro_followup',
    questionText: `Thank you for sharing that background. In that project or in your wider software engineering practice, what was the most difficult architectural trade-off or performance bottleneck you encountered, and how did you systematically diagnose, profile, and resolve it?`,
    hints: ['Focus on profiling metrics', 'Discuss trade-offs considered', 'Show systematic root-cause analysis'],
    expectedKeywords: ['trade-off', 'performance', 'latency', 'debugging', 'database', 'optimization', 'resolution', 'scale', 'profile'],
    depthLevel: 'foundational'
  });

  // First Deep Category Question
  const activeCategories = CS_CATEGORIES.filter(c => selectedCategoryIds.includes(c.id));
  const pool = activeCategories.length > 0 ? activeCategories : CS_CATEGORIES.slice(0, 3);
  const firstCat = pool[0];
  const diffKey = experienceLevel === 'junior' ? 'junior' : (experienceLevel === 'staff' || experienceLevel === 'senior' ? 'senior' : 'mid');

  plan.push({
    id: `elsa-${firstCat.id}-0`,
    phase: 'category_deep',
    categoryId: firstCat.id,
    categoryName: firstCat.name,
    questionText: `Now let's transition into your chosen discipline of ${firstCat.name}. ${firstCat.sampleQuestions[diffKey]}`,
    hints: firstCat.topics.slice(0, 3),
    expectedKeywords: firstCat.topics.flatMap(t => t.toLowerCase().split(/[\s,&()]+/)).filter(k => k.length > 3),
    depthLevel: experienceLevel === 'senior' || experienceLevel === 'staff' ? 'architectural' : 'deep'
  });

  return plan;
}

/**
 * Dynamically Generate the Next Adaptive Technical Question on the Fly (Context-Aware)
 */
export function generateNextDynamicQuestion(
  session: StarkInterviewSession,
  previousAnswerText: string,
  categoryIndex: number
): StarkQuestion {
  const analysis = analyzeCandidateContext(previousAnswerText);

  // If candidate mentioned a specific topic they know (e.g. OOP, OS, DSA), prioritize that!
  let categoryName = 'Computer Science & Software Design';
  let categoryId = 'dsa';
  let questionBody = '';
  let hints: string[] = ['Core Principles', 'Clean Architecture', 'Engineering Trade-offs'];
  let expectedKeywords: string[] = ['architecture', 'design', 'patterns', 'scalability'];

  if (analysis.recognizedTopicId && ADAPTIVE_CATEGORY_POOLS[analysis.recognizedTopicId]) {
    categoryId = analysis.recognizedTopicId;
    categoryName = analysis.acknowledgedTopicName || 'Software Design & OOP';
    const pool = ADAPTIVE_CATEGORY_POOLS[analysis.recognizedTopicId];
    const pickIndex = session.currentQuestionIndex % pool.length;
    const picked = pool[pickIndex];
    questionBody = picked.text;
    hints = picked.hints;
    expectedKeywords = picked.keywords;
  } else {
    const activeCategories = CS_CATEGORIES.filter(c => session.selectedCategories.includes(c.id));
    const pool = activeCategories.length > 0 ? activeCategories : CS_CATEGORIES.slice(0, 3);
    const targetCategory = pool[categoryIndex % pool.length];
    categoryId = targetCategory.id;
    categoryName = targetCategory.name;

    const adaptivePool = ADAPTIVE_CATEGORY_POOLS[targetCategory.id] || [];
    const pickIndex = session.currentQuestionIndex % (adaptivePool.length || 1);
    const picked = adaptivePool[pickIndex];
    const diffKey = session.experienceLevel === 'junior' ? 'junior' : (session.experienceLevel === 'staff' || session.experienceLevel === 'senior' ? 'senior' : 'mid');
    questionBody = picked ? picked.text : targetCategory.sampleQuestions[diffKey];
    hints = picked ? picked.hints : targetCategory.topics.slice(0, 3);
    expectedKeywords = picked ? picked.keywords : targetCategory.topics.flatMap(t => t.toLowerCase().split(/[\s,&()]+/)).filter(k => k.length > 3);
  }

  // Weave Elsa's conversational acknowledgment seamlessly into the question!
  const questionText = `${analysis.conversationalPrefix} Now let's explore ${categoryName}: ${questionBody}`;

  return {
    id: `elsa-${categoryId}-${Date.now()}`,
    phase: 'category_deep',
    categoryId,
    categoryName,
    questionText,
    hints,
    expectedKeywords,
    depthLevel: session.experienceLevel === 'senior' || session.experienceLevel === 'staff' ? 'architectural' : 'deep'
  };
}

/**
 * Intelligent Multi-Factor Answer Evaluation
 */
export function evaluateCandidateSpeechAnswer(
  question: StarkQuestion,
  answerText: string
): { score: number; feedback: string } {
  const clean = (answerText || '').trim();
  const wordCount = clean ? clean.split(/\s+/).length : 0;

  if (wordCount < 10) {
    return {
      score: 42,
      feedback: 'The answer was too brief. Elsa expects a structured explanation detailing mechanisms, reasoning, and technical depth.'
    };
  }

  // Keyword Matching
  const lower = clean.toLowerCase();
  let matchedKeywords = 0;
  for (const kw of question.expectedKeywords) {
    if (lower.includes(kw.toLowerCase())) {
      matchedKeywords++;
    }
  }

  // Base score from explanation length & articulation
  let baseScore = Math.min(65, 45 + Math.floor(wordCount / 3));

  // Keyword relevance bonus
  const relevanceBonus = Math.min(25, matchedKeywords * 4);

  // Depth markers
  let depthBonus = 0;
  const depthTerms = ['trade-off', 'complexity', 'latency', 'concurrency', 'memory', 'cpu', 'scalability', 'failure', 'cache', 'index', 'lock', 'packet', 'optim', 'invariant'];
  for (const term of depthTerms) {
    if (lower.includes(term)) {
      depthBonus += 2;
    }
  }
  depthBonus = Math.min(15, depthBonus);

  const rawScore = Math.min(98, Math.max(50, baseScore + relevanceBonus + depthBonus));

  let feedback = '';
  if (rawScore >= 88) {
    feedback = `Exceptional explanation! Clear articulation of core principles with strong trade-off analysis and technical vocabulary.`;
  } else if (rawScore >= 75) {
    feedback = `Solid technical foundation. Covered key concepts cleanly; could delve further into failure recovery and edge-case behaviors.`;
  } else if (rawScore >= 60) {
    feedback = `Good conceptual awareness. Elsa recommends adding concrete architecture examples and discussing algorithmic trade-offs.`;
  } else {
    feedback = `Answer touched on basics but lacked granular architectural depth. Review foundational mechanisms and implementation details.`;
  }

  return {
    score: rawScore,
    feedback
  };
}

/**
 * Final Evaluation Report Generation
 */
export function generateFinalStarkReport(session: StarkInterviewSession): StarkEvaluation {
  const transcripts = session.transcripts;
  if (!transcripts || transcripts.length === 0) {
    return {
      overallScore: 75,
      recommendation: 'LEAN_HIRE',
      technicalProficiencyScore: 78,
      communicationScore: 75,
      conceptualDepthScore: 72,
      problemSolvingScore: 76,
      categoryScores: {},
      keyStrengths: ['Demonstrated enthusiasm and baseline computer science foundations'],
      areasForImprovement: ['Practice structured technical articulation with the STAR framework'],
      detailedDebrief: 'Candidate completed session within allotted duration.'
    };
  }

  const avgScore = Math.round(transcripts.reduce((sum, t) => sum + t.score, 0) / transcripts.length);
  const commScore = Math.min(98, Math.round(avgScore * 0.95 + (transcripts.some(t => t.userAnswerText.length > 200) ? 8 : 2)));
  const depthScore = Math.min(98, Math.max(50, Math.round(avgScore * 1.02)));
  const probScore = Math.min(98, Math.max(50, Math.round((avgScore + depthScore) / 2)));

  const categoryScores: Record<string, number> = {};
  for (const t of transcripts) {
    const cat = t.category || 'General CS';
    if (!categoryScores[cat]) {
      categoryScores[cat] = t.score;
    } else {
      categoryScores[cat] = Math.round((categoryScores[cat] + t.score) / 2);
    }
  }

  let recommendation: 'STRONG_HIRE' | 'HIRE' | 'LEAN_HIRE' | 'NEEDS_PRACTICE' = 'LEAN_HIRE';
  if (avgScore >= 88) recommendation = 'STRONG_HIRE';
  else if (avgScore >= 78) recommendation = 'HIRE';
  else if (avgScore >= 65) recommendation = 'LEAN_HIRE';
  else recommendation = 'NEEDS_PRACTICE';

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (commScore >= 80) strengths.push('Clear and structured verbal communication with natural pacing.');
  else improvements.push('Work on verbal conciseness and structuring answers with headline-first summaries.');

  if (depthScore >= 80) strengths.push('Demonstrated deep architectural insight into underlying hardware and protocols.');
  else improvements.push('Deepen understanding of low-level kernel and memory management trade-offs.');

  if (avgScore >= 75) strengths.push('Comfortable navigating complex follow-up probes under live interview pressure.');
  else improvements.push('Practice handling unexpected technical curveballs with structured problem decomposition.');

  strengths.push('Comprehensive coverage of engineering fundamentals and project context.');
  improvements.push('Incorporate quantifiable metrics (e.g. latency reduction %, throughput QPS) when discussing projects.');

  return {
    overallScore: avgScore,
    recommendation,
    technicalProficiencyScore: avgScore,
    communicationScore: commScore,
    conceptualDepthScore: depthScore,
    problemSolvingScore: probScore,
    categoryScores,
    keyStrengths: strengths,
    areasForImprovement: improvements,
    detailedDebrief: `Elsa AI Interview Autopsy: Candidate demonstrated solid grasp of core computer science topics across ${session.selectedCategories.length} selected areas during the ${session.durationMinutes}-minute timed technical session. Maintained steady composure on camera and articulated key principles with commendable clarity.`
  };
}
